import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { pathJoin } from '$lib/misc';
import { getUserStorage, readSettings } from '$lib/server/bandSettings';
import { isFolderName } from '$lib/server/storage';
import { existingId, text } from '$lib/server/input';
import { error, type RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';
import type { DeepPartial } from 'typeorm';
import { requirePermission } from '$lib/server/session';

/** Save a song and make sure its folder exists in storage (creating or re-creating it if needed) */
export const POST = (async ({ request, locals }) => {
    requirePermission(locals, 'songbook.write');
    const song = await (await TypeOrm.getRepository(Song)).save(await songInput(await request.json()));
    await (await getUserStorage()).createDirectory(pathJoin(readSettings().songsFolder, song.storedDirName));
    return new Response(JSON.stringify(instanceToPlain(song)));
}) satisfies RequestHandler;

/** The fields this endpoint sets, with an `id` to update a song. Pins and tags have their own endpoints. */
async function songInput(body: Record<string, any>): Promise<DeepPartial<Song>> {
    if (!isFolderName(body.storedDirName)) error(400, "The song's folder name can't contain / or \\, or be . or ..");
    return {
        ...(body.id !== undefined && { id: await existingId(Song, body.id, 'song') }),
        title: text(body.title, 'title'),
        artist: text(body.artist ?? '', 'artist'),
        storedDirName: body.storedDirName,
        deleted: body.deleted === true,
    };
}
