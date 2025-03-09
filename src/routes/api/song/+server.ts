import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain, plainToClass } from 'class-transformer';

export const POST = (async ({ request }) => {
    const [postSongRequest, db] = await Promise.all([
        await request.json(),
        await TypeOrm.getDb(),
    ]);
    const newSong = plainToClass(Song, postSongRequest);
    let result = await db.manager.save(newSong);

    return new Response(JSON.stringify(instanceToPlain(result)));
}) satisfies RequestHandler;
