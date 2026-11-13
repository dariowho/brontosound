import { error } from '@sveltejs/kit';
import { confirmLink, isLinkRequest } from '$lib/server/backline/links';
import type { Actions, PageServerLoad } from './$types';

// Backline opens this page to be linked to whoever is signed in (docs/backline.md)
export const load = (({ url }) => {
    const request = url.searchParams.get('request');
    if (!isLinkRequest(request)) {
        error(400, 'Start linking from Backline: Settings → Sharing');
    }
    // Backline shows the same code: it tells the user this request is their own Backline's
    return { code: `${request.slice(0, 3)}-${request.slice(3, 6)}`.toUpperCase() };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ url, locals }) => {
        const request = url.searchParams.get('request');
        if (!locals.brontoSession || !isLinkRequest(request)) {
            error(403, 'Sign in first');
        }
        await confirmLink(request, locals.brontoSession.user.id);
        return { linked: true };
    },
} satisfies Actions;
