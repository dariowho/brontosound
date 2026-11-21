import { describe, expect, it } from 'vitest';
import { codeAt, newTotpSecret, totpStep, totpUri } from './totp';

// RFC 6238, appendix B: the SHA-1 secret "12345678901234567890", in base32
const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const step = (seconds: number) => Math.floor(seconds / 30);

describe('totp', () => {
    it('makes the codes of RFC 6238', () => {
        expect(codeAt(RFC_SECRET, step(59), 8)).toBe('94287082');
        expect(codeAt(RFC_SECRET, step(1111111109), 8)).toBe('07081804');
        expect(codeAt(RFC_SECRET, step(1234567890), 8)).toBe('89005924');
        expect(codeAt(RFC_SECRET, step(20000000000), 8)).toBe('65353130');
    });

    it('accepts the current code and its neighbours, nothing else', () => {
        const now = 1234567890_000;
        expect(totpStep(RFC_SECRET, '005924', now)).toBe(step(1234567890));
        expect(totpStep(RFC_SECRET, codeAt(RFC_SECRET, step(1234567890) - 1), now)).toBe(step(1234567890) - 1);
        expect(totpStep(RFC_SECRET, codeAt(RFC_SECRET, step(1234567890) + 2), now)).toBeNull();
        expect(totpStep(RFC_SECRET, '12345', now)).toBeNull();
        expect(totpStep(RFC_SECRET, 'abcdef', now)).toBeNull();
    });

    it('makes 160-bit secrets that round-trip, and the URI apps scan', () => {
        const secret = newTotpSecret();
        expect(secret).toMatch(/^[A-Z2-7]{32}$/);
        expect(totpStep(secret, codeAt(secret, step(Date.now() / 1000)))).not.toBeNull();
        expect(totpUri('ABC', 'anna@band.example', 'My Band')).toBe(
            'otpauth://totp/My%20Band%3Aanna%40band.example?secret=ABC&issuer=My+Band&algorithm=SHA1&digits=6&period=30');
    });
});
