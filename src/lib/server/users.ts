import { CredentialsSignin } from '@auth/sveltekit';
import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { IsNull, QueryFailedError } from 'typeorm';
import TypeOrm from '$lib/db';
import { User, UserAccount, UserRole } from '$lib/dbEntities/user';
import { readSettings } from '$lib/server/bandSettings';
import { hashPassword, isPasswordHash, MAX_PASSWORD_LENGTH, passwordProblem, verifyPassword } from '$lib/server/password';
import { localDataRoot, settingsFilename } from '$lib/server/config';
import { removeLinksOf } from '$lib/server/backline/links';
import { addressBlocked, loginWait, recordFailure, recordSuccess } from '$lib/server/loginThrottle';
import { breachCount } from '$lib/server/breachedPasswords';

// Built-in admin, whose password hash lives in band settings (`adminPasswordHash`)
export const DEFAULT_ADMIN_USERNAME = 'admin';

export class TooManyLoginAttempts extends CredentialsSignin {
    code = 'too_many_attempts';
}

// This login failed repeatedly: it may try again in a minute at most (see loginThrottle.ts)
export class LoginCoolingDown extends CredentialsSignin {
    code = 'slow_down';
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

// Emails listed in band settings' `authorizedGoogleSSOUsers` are made admin on Google sign-in (see docs/authentication.md)
export function isBootstrapAdmin(email: string): boolean {
    return readSettings().authorizedGoogleSSOUsers.some(e => normalizeEmail(e) === normalizeEmail(email));
}

// Users whose access is configured in band settings, so they can't be removed from the UI
function isManagedBySettings(user: User): boolean {
    return user.username === DEFAULT_ADMIN_USERNAME || (!!user.email && isBootstrapAdmin(user.email));
}

function isUniqueViolation(e: unknown): boolean {
    return e instanceof QueryFailedError && e.message.includes('UNIQUE constraint failed');
}

async function findUserByLogin(login: string, withPasswordHash = false): Promise<User | null> {
    const query = (await TypeOrm.getRepository(User)).createQueryBuilder('user')
        .where('(LOWER(user.email) = :login OR LOWER(user.username) = :login)', { login: normalizeEmail(login) });
    if (withPasswordHash) {
        query.addSelect('user.passwordHash');
    }
    return query.getOne();
}

export async function findActiveUser(id: number): Promise<User | null> {
    return (await TypeOrm.getRepository(User)).findOneBy({ id, removedDate: IsNull() });
}

// Compared against when the login matches no user, so response time doesn't reveal which emails exist
let dummyHash: Promise<string> | null = null;

// Brute-force guard: at most MAX_LOGIN_ATTEMPTS per key per window, reset on success. Sign-in keys include the
// client address, so nobody can lock out a known login (like `admin`) for everyone
export const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number, windowStart: number }>();

function clientAddress(): string {
    try {
        return getRequestEvent().getClientAddress();
    } catch {
        return 'unknown';
    }
}

export function countLoginAttempt(key: string): number {
    const now = Date.now();
    if (loginAttempts.size > 10_000) {
        loginAttempts.forEach((entry, key) => now - entry.windowStart > LOGIN_WINDOW_MS && loginAttempts.delete(key));
    }
    const entry = loginAttempts.get(key);
    if (!entry || now - entry.windowStart > LOGIN_WINDOW_MS) {
        loginAttempts.set(key, { count: 1, windowStart: now });
        return 1;
    }
    return ++entry.count;
}

export async function authenticateWithPassword(login: string, password: string): Promise<User | null> {
    if (!login || !password || password.length > MAX_PASSWORD_LENGTH) {
        return null;
    }
    login = normalizeEmail(login);
    const address = clientAddress();
    const attemptKey = `${address}|${login}`;
    if (countLoginAttempt(attemptKey) > MAX_LOGIN_ATTEMPTS || addressBlocked(address)) {
        throw new TooManyLoginAttempts();
    }
    if (loginWait(login) > 0) {
        throw new LoginCoolingDown();
    }
    const user = await findUserByLogin(login, true);
    let valid = false;
    if (user && !user.removedDate && user.passwordHash) {
        valid = await verifyPassword(password, user.passwordHash);
    } else {
        await verifyPassword(password, await (dummyHash ??= hashPassword('dummy'))); // takes as long as a real check
    }
    if (!valid) {
        recordFailure(login, address);
        return null;
    }
    loginAttempts.delete(attemptKey);
    recordSuccess(login);
    return user;
}

// For signed-in users confirming their password: throttled per user, separately from sign-in
export async function verifyCurrentPassword(id: number, password: string): Promise<boolean> {
    const attemptKey = `user:${id}`;
    if (countLoginAttempt(attemptKey) > MAX_LOGIN_ATTEMPTS) {
        throw new TooManyLoginAttempts();
    }
    const user = await (await TypeOrm.getRepository(User)).createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.id = :id', { id })
        .getOne();
    if (!user?.passwordHash || password.length > MAX_PASSWORD_LENGTH || !await verifyPassword(password, user.passwordHash)) {
        return false;
    }
    loginAttempts.delete(attemptKey);
    return true;
}

export async function findUserByAccount(provider: string, providerAccountId: string): Promise<User | null> {
    const account = await (await TypeOrm.getRepository(UserAccount)).findOne({
        where: { provider, providerAccountId },
        relations: { user: true },
    });
    return account && !account.user.removedDate ? account.user : null;
}

// Returns the user behind an external account, linking it first if it is new and `verifiedEmail` matches an active user
export async function findOrLinkUser(provider: string, providerAccountId: string, verifiedEmail: string): Promise<User | null> {
    const linkedUser = await findUserByAccount(provider, providerAccountId);
    if (linkedUser) {
        return linkedUser;
    }
    const user = await findUserByLogin(verifiedEmail, true);
    if (!user?.email || user.removedDate || normalizeEmail(user.email) !== normalizeEmail(verifiedEmail)) {
        return null;
    }
    // Rows auto-created by the old allow-list scheme have no password: removing an email from the list used to revoke
    // access, so they must not get back in by email
    if (!user.passwordHash && !isBootstrapAdmin(user.email)) {
        return null;
    }
    // orIgnore: a concurrent sign-in may have just linked it
    await (await TypeOrm.getRepository(UserAccount)).createQueryBuilder().insert()
        .values({ user: { id: user.id }, provider, providerAccountId, email: normalizeEmail(verifiedEmail) })
        .orIgnore()
        .execute();
    return findUserByAccount(provider, providerAccountId);
}

export async function ensureBootstrapAdmin(email: string, name: string): Promise<void> {
    const users = await TypeOrm.getRepository(User);
    const user = await findUserByLogin(email) ?? users.create({ email: normalizeEmail(email), username: normalizeEmail(email), name });
    if (user.id && user.role === UserRole.ADMIN && !user.removedDate) {
        return;
    }
    user.role = UserRole.ADMIN;
    user.removedDate = null;
    try {
        await users.save(user);
    } catch (e) {
        // A concurrent sign-in created it first
        if (!isUniqueViolation(e)) {
            throw e;
        }
    }
}

// Creates or updates the default admin from band settings; called at startup, fails if the hash is missing
export async function ensureDefaultAdmin(): Promise<void> {
    const passwordHash = readSettings().adminPasswordHash;
    if (!isPasswordHash(passwordHash)) {
        throw new Error(`${localDataRoot}/${settingsFilename}: "adminPasswordHash" is missing or invalid. Generate it with: npm run hash-password`);
    }
    const users = await TypeOrm.getRepository(User);
    const admin = await findUserByLogin(DEFAULT_ADMIN_USERNAME, true)
        ?? users.create({ username: DEFAULT_ADMIN_USERNAME, name: 'Admin', email: null, sessionVersion: 0 });
    if (admin.id && admin.passwordHash === passwordHash && admin.role === UserRole.ADMIN && !admin.removedDate) {
        return;
    }
    if (admin.id && admin.passwordHash !== passwordHash) {
        admin.sessionVersion++; // password changed in settings: sign out everywhere
    }
    Object.assign(admin, { passwordHash, role: UserRole.ADMIN, removedDate: null });
    await users.save(admin);
}

export interface UserListItem {
    id: number;
    name: string;
    login: string;
    role: UserRole;
    signInMethods: string[];
    managedBySettings: boolean;
}

export async function listUsers(): Promise<UserListItem[]> {
    const users = await (await TypeOrm.getRepository(User)).createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .leftJoinAndSelect('user.accounts', 'account')
        .where('user.removedDate IS NULL')
        .orderBy('user.name')
        .getMany();
    return users.map(user => ({
        id: user.id,
        name: user.name,
        login: user.email ?? user.username,
        role: user.role,
        signInMethods: [
            ...(user.passwordHash ? ['password'] : []),
            ...new Set(user.accounts?.map(account => account.provider)),
        ],
        managedBySettings: isManagedBySettings(user),
    }));
}

/** What's wrong with a new password, or null: its length, or being found in data breaches (`breachedPasswordCheck`) */
export async function newPasswordProblem(password: string): Promise<string | null> {
    const problem = passwordProblem(password);
    if (problem || !readSettings().breachedPasswordCheck) return problem;
    const count = await breachCount(password);
    if (count === null) console.warn("Couldn't check a new password against known breaches: allowed");
    return count ? 'This password has appeared in data breaches. Choose another one.' : null;
}

// Re-adding the email of a removed user restores it with the new password and role
export async function createUser(input: { email: unknown, name?: unknown, password: unknown, role?: unknown }): Promise<User> {
    const email = normalizeEmail(String(input.email ?? ''));
    const name = String(input.name ?? '').trim() || email;
    const password = String(input.password ?? '');
    const role = (input.role ?? UserRole.EDITOR) as UserRole;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error(400, 'Invalid email address');
    }
    const problem = await newPasswordProblem(password);
    if (problem) {
        error(400, problem);
    }
    if (!Object.values(UserRole).includes(role)) {
        error(400, 'Invalid role');
    }

    const users = await TypeOrm.getRepository(User);
    const existing = await findUserByLogin(email);
    if (existing && !existing.removedDate) {
        error(409, 'A user with this email already exists');
    }
    const user = existing ?? users.create({ email, username: email });
    Object.assign(user, { name, role, passwordHash: await hashPassword(password), removedDate: null });
    try {
        const saved = await users.save(user);
        return (await findActiveUser(saved.id))!;
    } catch (e) {
        if (isUniqueViolation(e)) {
            error(409, 'A user with this email already exists');
        }
        throw e;
    }
}

// Revokes all sign-in methods, sessions and Backline links, and hides the user; see `User.removedDate`
export async function removeUser(id: number): Promise<void> {
    const user = await findActiveUser(id);
    if (!user) {
        error(404, 'User not found');
    }
    if (isManagedBySettings(user)) {
        error(400, 'This user is configured in band settings and cannot be removed here');
    }
    const db = await TypeOrm.getDb();
    await db.transaction(async manager => {
        await manager.delete(UserAccount, { user: { id } });
        await manager.update(User, id, { removedDate: new Date(), passwordHash: null });
        await manager.increment(User, { id }, 'sessionVersion', 1);
    });
    await removeLinksOf(id);
}

export async function getProfile(id: number) {
    const user = await (await TypeOrm.getRepository(User)).createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.id = :id', { id })
        .getOneOrFail();
    return {
        name: user.name,
        login: user.email ?? user.username,
        role: user.role,
        hasPassword: !!user.passwordHash,
        isDefaultAdmin: user.username === DEFAULT_ADMIN_USERNAME,
    };
}

export async function updateName(id: number, name: string): Promise<void> {
    await (await TypeOrm.getRepository(User)).update(id, { name });
}

// Ends all the user's sessions, current one included: they carry the old `sessionVersion`
export async function signOutEverywhere(id: number): Promise<void> {
    await (await TypeOrm.getRepository(User)).increment({ id }, 'sessionVersion', 1);
}

// Also signs the user out everywhere, current session included
export async function changePassword(id: number, password: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    const db = await TypeOrm.getDb();
    await db.transaction(async manager => {
        await manager.update(User, id, { passwordHash });
        await manager.increment(User, { id }, 'sessionVersion', 1);
    });
}
