import { syncSongsFolder } from '$lib/server/cachedStorage';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * List the content of a folder in the configured backend storage
 */
export const GET = (async ({ url }) => {
    return new Response(JSON.stringify(await syncSongsFolder()));

}) satisfies RequestHandler;

