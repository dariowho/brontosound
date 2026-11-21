import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Time-based one-time passwords (RFC 6238), as authenticator apps make them: HMAC-SHA1, 6 digits, every 30 s.

const PERIOD_S = 30;
const DIGITS = 6;
const DRIFT_STEPS = 1; // codes from one period before or after are accepted: clocks drift
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function newTotpSecret(): string {
    return toBase32(randomBytes(20));
}

/** What authenticator apps scan, as a QR code */
export function totpUri(secret: string, account: string, issuer: string): string {
    const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: String(DIGITS), period: String(PERIOD_S) });
    return `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?${params}`;
}

/** The time step `code` belongs to, if it's valid now (give or take the drift); else null */
export function totpStep(secret: string, code: string, now = Date.now()): number | null {
    if (!/^\d{6}$/.test(code)) return null;
    const current = Math.floor(now / 1000 / PERIOD_S);
    for (let step = current - DRIFT_STEPS; step <= current + DRIFT_STEPS; step++) {
        if (timingSafeEqual(Buffer.from(codeAt(secret, step)), Buffer.from(code))) return step;
    }
    return null;
}

export function codeAt(secret: string, step: number, digits = DIGITS): string {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(step));
    const hmac = createHmac('sha1', fromBase32(secret)).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    return String((hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).padStart(digits, '0');
}

function toBase32(bytes: Buffer): string {
    let bits = 0, value = 0, text = '';
    for (const byte of bytes) {
        value = ((value << 8) | byte) & 0xffff;
        for (bits += 8; bits >= 5; bits -= 5) text += BASE32[(value >>> (bits - 5)) & 31];
    }
    return bits > 0 ? text + BASE32[(value << (5 - bits)) & 31] : text;
}

function fromBase32(text: string): Buffer {
    let bits = 0, value = 0;
    const bytes: number[] = [];
    for (const char of text.toUpperCase().replace(/=+$/, '')) {
        const index = BASE32.indexOf(char);
        if (index < 0) throw new Error('Invalid base32');
        value = ((value << 5) | index) & 0xffff;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}
