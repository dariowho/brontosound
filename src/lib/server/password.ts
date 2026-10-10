import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Stored as `scrypt$N$r$p$<salt>$<hash>` (base64), so parameters can be raised later
const N = 32768, R = 8, P = 1, KEY_LENGTH = 64;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 1024;

export function passwordProblem(password: string): string | null {
    return password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH
        ? `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters`
        : null;
}

// Accepts only what hashPassword produces (bounded params, full-length salt and key): a hand-made value like
// `scrypt$32768$8$1$x$x` would otherwise decode to an empty key and match any password
function parseHash(stored: string) {
    const match = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([A-Za-z0-9+/]+=*)\$([A-Za-z0-9+/]+=*)$/.exec(stored);
    if (!match) {
        return null;
    }
    const [n, r, p] = match.slice(1, 4).map(Number);
    const salt = Buffer.from(match[4], 'base64'), hash = Buffer.from(match[5], 'base64');
    const valid = n >= 2 ** 14 && n <= 2 ** 20 && (n & (n - 1)) === 0 && r >= 1 && r <= 32 && p >= 1 && p <= 16
        && salt.length >= 16 && hash.length === KEY_LENGTH;
    return valid ? { n, r, p, salt, hash } : null;
}

export function isPasswordHash(value: unknown): value is string {
    return typeof value === 'string' && parseHash(value) !== null;
}

// scrypt runs on the libuv threadpool (4 threads), which sqlite also uses: cap it so login floods can't starve the DB
const MAX_CONCURRENT_SCRYPT = 2;
let runningScrypt = 0;
const scryptQueue: (() => void)[] = [];

async function scryptAsync(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
    if (runningScrypt < MAX_CONCURRENT_SCRYPT) {
        runningScrypt++;
    } else {
        await new Promise<void>(resolve => scryptQueue.push(resolve)); // the finishing call hands over its slot
    }
    try {
        return await new Promise((resolve, reject) =>
            scrypt(password, salt, keyLength, options, (err, key) => err ? reject(err) : resolve(key)));
    } finally {
        const next = scryptQueue.shift();
        if (next) {
            next();
        } else {
            runningScrypt--;
        }
    }
}

function scryptOptions(n: number, r: number, p: number): ScryptOptions {
    return { N: n, r, p, maxmem: 256 * n * r };
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const hash = await scryptAsync(password, salt, KEY_LENGTH, scryptOptions(N, R, P));
    return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const parsed = parseHash(stored);
    if (!parsed) {
        return false;
    }
    const actual = await scryptAsync(password, parsed.salt, parsed.hash.length, scryptOptions(parsed.n, parsed.r, parsed.p));
    return timingSafeEqual(actual, parsed.hash);
}
