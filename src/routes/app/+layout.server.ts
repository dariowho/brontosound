import { env } from '$env/dynamic/private';
import { safeBandSettings } from '$lib/server/bandSettings';
import { authSecretWarning } from '$lib/server/authSecret';
import { can } from '$lib/permissions';
import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
    return {
        safeBandSettings: safeBandSettings(),
        // Configuration problems, for the admins who can fix them
        configWarnings: can(locals.brontoSession, 'bandSettings.write') ? [authSecretWarning(env.AUTH_SECRET)].filter(Boolean) : [],
    };
}) satisfies LayoutServerLoad;
