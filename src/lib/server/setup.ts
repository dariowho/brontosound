import { existsSync } from 'fs';
import { env } from '$env/dynamic/private';
import { settingsPath } from '$lib/server/config';
import { checkAuthSecret } from '$lib/server/authSecret';
import { readSettings } from '$lib/server/bandSettings';
import { moveSongsFolderToFiles } from '$lib/server/filesFolder';
import { ensureDefaultAdmin } from '$lib/server/users';
import setupPageHtml from './setupPage.html?raw';

let started: Promise<void> | null = null;

/** Whether `npm run init` has set up AUTH_SECRET and the data folder. The first time it has, readies the app. */
export async function isSetUp(): Promise<boolean> {
    if (!started && env.AUTH_SECRET && existsSync(settingsPath)) {
        started = start();
    }
    await started;
    return !!started;
}

async function start(): Promise<void> {
    checkAuthSecret(env.AUTH_SECRET);
    const { songsFolder, webdavEnabled } = readSettings();
    moveSongsFolderToFiles(songsFolder ?? '', !webdavEnabled);
    await ensureDefaultAdmin();
}

/** What every request gets until then: how to set up */
export function setupPage(): Response {
    return new Response(setupPageHtml, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
