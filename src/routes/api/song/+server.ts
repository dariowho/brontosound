import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { pathJoin } from '$lib/misc';
import { getUserStorage, readSettings } from '$lib/server/bandSettings';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain, plainToClass } from 'class-transformer';

/** Save a song and make sure its folder exists in storage (creating or re-creating it if needed) */
export const POST = (async ({ request }) => {
    const [postSongRequest, db, storage] = await Promise.all([
        await request.json(),
        await TypeOrm.getDb(),
        await getUserStorage(),
    ]);
    const newSong = plainToClass(Song, postSongRequest);
    let result = await db.manager.save(newSong);
    await storage.createDirectory(pathJoin(readSettings().songsFolder, result.storedDirName));

    return new Response(JSON.stringify(instanceToPlain(result)));
}) satisfies RequestHandler;
