import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { pathJoin } from '$lib/misc';
import { getUserStorage, readSettings } from '$lib/server/bandSettings';
import { isFolderName } from '$lib/server/storage';
import { error, type RequestHandler } from '@sveltejs/kit';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { requirePermission } from '$lib/server/session';

/** Save a song and make sure its folder exists in storage (creating or re-creating it if needed) */
export const POST = (async ({ request, locals }) => {
    requirePermission(locals, 'songbook.write');
    const [postSongRequest, db, storage] = await Promise.all([
        await request.json(),
        await TypeOrm.getDb(),
        await getUserStorage(),
    ]);
    const newSong = plainToClass(Song, postSongRequest);
    if (!isFolderName(newSong.storedDirName)) error(400, "The song's folder name can't contain / or \\, or be . or ..");
    let result = await db.manager.save(newSong);
    await storage.createDirectory(pathJoin(readSettings().songsFolder, result.storedDirName));

    return new Response(JSON.stringify(instanceToPlain(result)));
}) satisfies RequestHandler;
