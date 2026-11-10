import { listUsers } from '$lib/server/users';
import { readSettings } from '$lib/server/bandSettings';
import { settingsFilename } from '$lib/server/config';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const canManageUsers = !!locals.brontoSession?.permissions.includes('users.manage');
    const s = readSettings();

    // Read-only; secrets (passwords, tokens) are never sent.
    const settings = [
        { title: "Band", entries: { "Band name": s.bandName, "Locale": s.locale } },
        { title: "WebDAV", entries: {
            "Enabled": s.webdavEnabled,
            "Server": s.webdavServer,
            "Username": s.webdavUsername,
            "Songs folder": s.songsFolder,
        } },
        { title: "YouTube", entries: { "Use Invidious": s.ytInvidiousEnabled, "Invidious server": s.ytInvidiousServer } },
    ];

    return {
        pageTitle: "Settings",
        breadcrumb: [{title: "Settings"}],
        users: canManageUsers ? await listUsers() : null,
        settings,
        settingsFilename,
    };
}) satisfies PageServerLoad;
