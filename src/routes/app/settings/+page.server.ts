import { listUsers } from '$lib/server/users';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const canManageUsers = !!locals.brontoSession?.permissions.includes('users.manage');

    return {
        pageTitle: "Settings",
        breadcrumb: [{title: "Settings"}],
        users: canManageUsers ? await listUsers() : null,
    };
}) satisfies PageServerLoad;
