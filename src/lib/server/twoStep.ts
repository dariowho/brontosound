import TypeOrm from '$lib/db';
import { User } from '$lib/dbEntities/user';
import { readSettings } from './bandSettings';
import { newTotpSecret, totpStep, totpUri } from './totp';

// Two-step verification for password sign-ins: a code from an authenticator app (TOTP). See docs/authentication.md

const users = () => TypeOrm.getRepository(User);

async function withSecret(userId: number): Promise<User> {
    return (await users()).createQueryBuilder('user').addSelect(['user.totpSecret', 'user.totpLastStep'])
        .where('user.id = :userId', { userId }).getOneOrFail();
}

/** A new secret for the user to scan, kept until confirmed: two-step stays off until then */
export async function startTwoStepSetup(userId: number): Promise<void> {
    await (await users()).update(userId, { totpSecret: newTotpSecret(), totpEnabled: false, totpLastStep: null });
}

/** What authenticator apps scan to set up two-step, while it's being set up; else null */
export async function twoStepSetupUri(userId: number, account: string): Promise<string | null> {
    const user = await withSecret(userId);
    return user.totpSecret && !user.totpEnabled ? totpUri(user.totpSecret, account, readSettings().bandName) : null;
}

/** Whether `code` is valid for the user and new: each code works once */
export async function useTwoStepCode(userId: number, code: string): Promise<boolean> {
    const user = await withSecret(userId);
    const step = user.totpSecret ? totpStep(user.totpSecret, code.trim()) : null;
    if (step === null || (user.totpLastStep ?? -1) >= step) return false;
    await (await users()).update(userId, { totpLastStep: step });
    return true;
}

/** Turns two-step on, if `code` matches the secret being set up */
export async function confirmTwoStep(userId: number, code: string): Promise<boolean> {
    if (!await useTwoStepCode(userId, code)) return false;
    await (await users()).update(userId, { totpEnabled: true });
    return true;
}

/** Turns two-step off: by the user (after a valid code), or by an admin when the device is lost */
export async function resetTwoStep(userId: number): Promise<void> {
    await (await users()).update(userId, { totpSecret: null, totpEnabled: false, totpLastStep: null });
}
