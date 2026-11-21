import { describe, expect, it } from 'vitest';
import { hashPassword, isPasswordHash, PasswordCheckBusy, passwordProblem, verifyPassword } from './password';

describe('password', () => {
    it('verifies the right password and rejects a wrong one', async () => {
        const hash = await hashPassword('correct horse');
        expect(await verifyPassword('correct horse', hash)).toBe(true);
        expect(await verifyPassword('wrong horse', hash)).toBe(false);
    });

    it('salts each hash', async () => {
        expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
    });

    it('rejects malformed hashes', async () => {
        expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
    });

    it('recognizes its own hash format', async () => {
        expect(isPasswordHash(await hashPassword('correct horse'))).toBe(true);
        expect(isPasswordHash('plaintext')).toBe(false);
        expect(isPasswordHash(undefined)).toBe(false);
    });

    it('rejects hand-made hashes that would match anything or break scrypt', async () => {
        for (const bogus of ['scrypt$32768$8$1$x$x', 'scrypt$3$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA']) {
            expect(isPasswordHash(bogus)).toBe(false);
            expect(await verifyPassword('anything', bogus)).toBe(false);
        }
    });

    it('enforces password length', () => {
        expect(passwordProblem('short')).not.toBeNull();
        expect(passwordProblem('eleven char')).not.toBeNull();
        expect(passwordProblem('twelve chars')).toBeNull();
    });
});

describe('password check queue', () => {
    it('refuses checks past the queue, rather than letting them pile up', async () => {
        const hash = await hashPassword('correct horse');
        const results = await Promise.allSettled(Array.from({ length: 40 }, () => verifyPassword('correct horse', hash)));
        const refused = results.filter(r => r.status == 'rejected');
        expect(refused.length).toBe(40 - 2 - 32); // 2 running, 32 waiting
        expect((refused[0] as PromiseRejectedResult).reason).toBeInstanceOf(PasswordCheckBusy);
        expect(await verifyPassword('correct horse', hash)).toBe(true); // and it recovers
    });
});
