import { syncSongsFolder } from '$lib/server/cachedStorage';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Sync the songs folder: create it if missing, list its song folders and cache them. POST: it changes state
 */
export const POST = (async () => {
    return new Response(JSON.stringify(await syncSongsFolder()));

}) satisfies RequestHandler;

