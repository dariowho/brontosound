// Failed password checks, counted per login (from any address) and per address (for any login), in memory.
// Per login: after FREE_FAILURES, each try waits 1 s, 2 s, 4 s… up to a minute since the last failure: guessing slows
// to a crawl, while the owner is held up a minute at most (no lockout). Per address: password spraying stops at
// MAX_ADDRESS_FAILURES. Both forget after FORGET_MS without failures.

const FREE_FAILURES = 5;
const MAX_DELAY_MS = 60_000;
const MAX_ADDRESS_FAILURES = 50;
const FORGET_MS = 15 * 60_000;

const failures = new Map<string, { count: number, last: number }>();

function failuresOf(key: string, now: number): number {
    const entry = failures.get(key);
    return entry && now - entry.last < FORGET_MS ? entry.count : 0;
}

/** Milliseconds `login` has to wait before its next try; 0 when it may try now */
export function loginWait(login: string, now = Date.now()): number {
    const count = failuresOf(`login|${login}`, now);
    if (count < FREE_FAILURES) return 0;
    const delay = Math.min(1000 * 2 ** (count - FREE_FAILURES), MAX_DELAY_MS);
    return Math.max(0, failures.get(`login|${login}`)!.last + delay - now);
}

export function addressBlocked(address: string, now = Date.now()): boolean {
    return failuresOf(`address|${address}`, now) >= MAX_ADDRESS_FAILURES;
}

export function recordFailure(login: string, address: string, now = Date.now()): void {
    if (failures.size > 10_000) {
        failures.forEach((entry, key) => now - entry.last >= FORGET_MS && failures.delete(key));
    }
    for (const key of [`login|${login}`, `address|${address}`]) {
        failures.set(key, { count: failuresOf(key, now) + 1, last: now });
    }
}

export function recordSuccess(login: string): void {
    failures.delete(`login|${login}`);
}
