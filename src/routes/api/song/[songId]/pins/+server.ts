import { error, json, type RequestHandler } from '@sveltejs/kit';
import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { findStoredSong } from '$lib/server/songFolder';
import type { SongPins } from '$lib/songFiles/songFile';
import { requirePermission } from '$lib/server/session';

const isPath = (value: unknown) => value === null || typeof value == 'string';

/** Set the files the song page opens with */
export const POST = (async ({ params, request, locals }) => {
    requirePermission(locals, 'songbook.write');
    const song = await findStoredSong(params.songId);
    const { pinnedDocument, pinnedAudio } = await request.json() as SongPins;
    if (!isPath(pinnedDocument) || !isPath(pinnedAudio)) error(400, "Pins must be file paths or null");

    await (await TypeOrm.getDb()).getRepository(Song).update(song.id, { pinnedDocument, pinnedAudio });
    return json({ pinnedDocument, pinnedAudio } satisfies SongPins);
}) satisfies RequestHandler;
