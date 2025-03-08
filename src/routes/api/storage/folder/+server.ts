import { syncFolder } from '$lib/server/cachedStorage';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * List the content of a folder in the configured backend storage
 */
export const GET = (async ({ url }) => {
    const path = url.searchParams.get('path');
    
    if (!path) {
        return new Response(JSON.stringify({ error: 'Path parameter is required' }), { status: 400 });
    }

    return new Response(JSON.stringify(await syncFolder(path)));

}) satisfies RequestHandler;
