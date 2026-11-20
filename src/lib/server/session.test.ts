import { describe, expect, it } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import { permissionsFromRole, UserRole } from '$lib/dbEntities/user';
import { requirePermission } from './session';

const localsOf = (role: UserRole) => ({ brontoSession: { permissions: permissionsFromRole[role] } }) as App.Locals;

function statusOf(check: () => unknown): number {
    try {
        check();
        return 200;
    } catch (e) {
        if (isHttpError(e)) return e.status;
        throw e;
    }
}

describe('requirePermission', () => {
    it('lets viewers read, not write', () => {
        expect(statusOf(() => requirePermission(localsOf(UserRole.VIEWER), 'songbook.read'))).toBe(200);
        for (const permission of ['songbook.write', 'live.write', 'bandSettings.write', 'users.manage']) {
            expect(statusOf(() => requirePermission(localsOf(UserRole.VIEWER), permission))).toBe(403);
        }
    });

    it('lets editors write songs and gigs, not settings', () => {
        expect(statusOf(() => requirePermission(localsOf(UserRole.EDITOR), 'songbook.write'))).toBe(200);
        expect(statusOf(() => requirePermission(localsOf(UserRole.EDITOR), 'live.write'))).toBe(200);
        expect(statusOf(() => requirePermission(localsOf(UserRole.EDITOR), 'bandSettings.write'))).toBe(403);
    });
});
