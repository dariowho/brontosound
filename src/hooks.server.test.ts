import { describe, expect, it, vi } from 'vitest';
import { isHttpError, isRedirect, type RequestEvent } from '@sveltejs/kit';

vi.mock('./auth', () => ({ handle: vi.fn() }));
vi.mock('$lib/server/users', () => ({ ensureDefaultAdmin: vi.fn(), findActiveUser: vi.fn(async () => null) }));

import { authorizationHandle, handleError } from './hooks.server';

/** What the guard does for a visitor (no session) on `path`, which SvelteKit matched to route `routeId` */
async function visit(path: string, routeId: string | null): Promise<number> {
    const event = { url: new URL(`http://localhost${path}`), route: { id: routeId }, locals: { auth: async () => null } };
    try {
        await authorizationHandle({ event: event as unknown as RequestEvent, resolve: async () => new Response('ok') });
        return 200;
    } catch (e) {
        if (isHttpError(e) || isRedirect(e)) return e.status;
        throw e;
    }
}

describe('authorization guard', () => {
    it('turns visitors away from API and app routes, also when the path is percent-encoded', async () => {
        expect(await visit('/api/storage/folder', '/api/song/[songId]/folder')).toBe(401);
        expect(await visit('/%61pi/song/1/folder', '/api/song/[songId]/folder')).toBe(401);
        expect(await visit('/%61pp/settings', '/app/settings')).toBe(303);
    });

    it('lets visitors into public routes and 404s', async () => {
        for (const route of ['/', '/signin', '/signout', '/backline', '/backline/client']) {
            expect(await visit(route, route)).toBe(200);
        }
        expect(await visit('/nowhere', null)).toBe(200);
    });

    it('turns visitors away from routes that are not listed as public', async () => {
        expect(await visit('/backlineish', '/backlineish')).toBe(303);
    });
});

describe('error handler', () => {
    const handle = (status: number, error: unknown) =>
        handleError({ error, status, message: status == 404 ? 'Not Found' : 'Internal Error', event: {} as RequestEvent });

    it('keeps unexpected error details out of responses', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const response = handle(500, new Error("ENOENT: no such file, open '/app/data/x'"));
        expect(response).toEqual({ message: expect.stringMatching(/^Something went wrong \(error [0-9a-f]{8}\)$/) });
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error '), expect.any(Error));
    });

    it('passes 4xx messages through', () => {
        expect(handle(404, new Error('Not found: /nowhere'))).toEqual({ message: 'Not Found' });
    });
});
