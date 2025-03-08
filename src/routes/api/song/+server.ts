import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { syncSongsFolder } from '$lib/server/cachedStorage';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain, plainToClass } from 'class-transformer';

/**
 * List the content of a folder in the configured backend storage
 */
// export const POST = (async ({ url }) => {
//     return new Response(JSON.stringify(await syncSongsFolder()));

// }) satisfies RequestHandler;

export const POST = (async ({ request }) => {
    const [postTagsRequest, db] = await Promise.all([
        await request.json(),
        await TypeOrm.getDb(),
    ]);
    const newSong = plainToClass(Song, postTagsRequest);
    let result = await db.manager.save(newSong);

    return new Response(JSON.stringify(instanceToPlain(result)));
}) satisfies RequestHandler;