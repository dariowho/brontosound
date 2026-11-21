import { describe, expect, it } from 'vitest';
import { breachCount } from './breachedPasswords';

// SHA-1 of "password": 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
const range = (body: string, status = 200) => (async (url: string) => {
    expect(url).toBe('https://api.pwnedpasswords.com/range/5BAA6');
    return new Response(body, { status });
}) as typeof fetch;

describe('breachCount', () => {
    it('finds the password among the hashes sharing its prefix, sending only the prefix', async () => {
        expect(await breachCount('password', range('0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:9659365\r\n'))).toBe(9659365);
        expect(await breachCount('password', range('0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n'))).toBe(0);
    });

    it("says null when it can't check", async () => {
        expect(await breachCount('password', range('', 503))).toBeNull();
        expect(await breachCount('password', (async () => { throw new Error('offline'); }) as typeof fetch)).toBeNull();
    });
});
