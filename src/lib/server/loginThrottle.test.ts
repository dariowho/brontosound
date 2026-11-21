import { describe, expect, it } from 'vitest';
import { addressBlocked, loginWait, recordFailure, recordSuccess } from './loginThrottle';

describe('login throttle', () => {
    it('lets a login fail 5 times freely, then doubles the wait up to a minute', () => {
        const t = 1_000_000;
        for (let i = 0; i < 5; i++) recordFailure('anna', `10.0.0.${i}`, t);
        expect(loginWait('anna', t)).toBe(1000);
        recordFailure('anna', '10.0.0.9', t);
        expect(loginWait('anna', t + 500)).toBe(1500);
        for (let i = 0; i < 20; i++) recordFailure('anna', '10.0.0.9', t);
        expect(loginWait('anna', t)).toBe(60_000);
        expect(loginWait('anna', t + 60_000)).toBe(0);
    });

    it('forgets failures after a success, or 15 quiet minutes', () => {
        for (let i = 0; i < 8; i++) recordFailure('bob', '10.0.1.1', 0);
        expect(loginWait('bob', 0)).toBeGreaterThan(0);
        expect(loginWait('bob', 15 * 60_000)).toBe(0);
        recordSuccess('bob');
        expect(loginWait('bob', 0)).toBe(0);
    });

    it('blocks an address after 50 failures, whichever logins it tries', () => {
        for (let i = 0; i < 49; i++) recordFailure(`user${i}`, '10.0.2.2', 0);
        expect(addressBlocked('10.0.2.2', 0)).toBe(false);
        recordFailure('user49', '10.0.2.2', 0);
        expect(addressBlocked('10.0.2.2', 0)).toBe(true);
        expect(addressBlocked('10.0.2.3', 0)).toBe(false);
    });
});
