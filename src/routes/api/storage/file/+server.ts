import { syncFile, writeTextFile } from '$lib/server/cachedStorage';
import { error, type RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';

/**
 * List the content of a folder in the configured backend storage
 */
export const GET = (async ({ url }) => {
    const path = url.searchParams.get('path');
    if (!path) {
        return new Response(JSON.stringify({ error: 'Path parameter is required' }), { status: 400 });
    }

    try {
        const file = await syncFile(path);
        return new Response(JSON.stringify(instanceToPlain(file)));
    } catch (FileNotFoundError) {
        error(404, `File not found: ${path}`)
    }

}) satisfies RequestHandler;

export const POST = (async ({ url, request }) => {
    const path = url.searchParams.get('path');
    if (!path) {
        return new Response(JSON.stringify({ error: 'Path parameter is required' }), { status: 400 });
    }
    const content = await request.text();
    const file = await writeTextFile(path, content);
    return new Response(JSON.stringify(instanceToPlain(file)));
}) satisfies RequestHandler;