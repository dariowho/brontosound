import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'fs';
import { env } from '$env/dynamic/private';
import { ensureDefaultAdmin } from '$lib/server/users';

vi.mock('fs', () => ({ existsSync: vi.fn() }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/bandSettings', () => ({ readSettings: () => ({ songsFolder: 'Songs', webdavEnabled: false }) }));
vi.mock('$lib/server/filesFolder', () => ({ moveSongsFolderToFiles: vi.fn() }));
vi.mock('$lib/server/users', () => ({ ensureDefaultAdmin: vi.fn() }));

import { isSetUp, setupPage } from './setup';

describe('setup', () => {
    it('waits for AUTH_SECRET and the band settings, then starts the app once', async () => {
        env.AUTH_SECRET = 'a'.repeat(44);
        vi.mocked(existsSync).mockReturnValue(false);
        expect(await isSetUp()).toBe(false);

        env.AUTH_SECRET = '';
        vi.mocked(existsSync).mockReturnValue(true);
        expect(await isSetUp()).toBe(false);
        expect(ensureDefaultAdmin).not.toHaveBeenCalled();

        env.AUTH_SECRET = 'a'.repeat(44);
        expect(await isSetUp()).toBe(true);
        expect(await isSetUp()).toBe(true);
        expect(ensureDefaultAdmin).toHaveBeenCalledTimes(1);
    });

    it('explains how to set up, as unavailable', async () => {
        const response = setupPage();
        expect(response.status).toBe(503);
        expect(await response.text()).toContain('npm run init');
    });
});
