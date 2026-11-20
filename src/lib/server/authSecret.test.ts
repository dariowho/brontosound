import { describe, expect, it, vi } from 'vitest';
import { checkAuthSecret } from './authSecret';

describe('checkAuthSecret', () => {
    it('refuses a missing or placeholder secret', () => {
        for (const secret of [undefined, '', 'a-secret-of-your-choice']) {
            expect(() => checkAuthSecret(secret)).toThrow('AUTH_SECRET');
        }
    });

    it('accepts a short secret with a warning, a long one silently', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        checkAuthSecret('short-but-random');
        expect(warn).toHaveBeenCalledOnce();
        checkAuthSecret('x'.repeat(44));
        expect(warn).toHaveBeenCalledOnce();
    });
});
