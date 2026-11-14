import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { error, json, type RequestHandler } from '@sveltejs/kit';

/** Permanently delete a song from the Songbook. Its folder in storage, if any, is left untouched. */
export const DELETE = (async ({ params }) => {
    const songs = (await TypeOrm.getDb()).getRepository(Song);
    const song = await songs.findOneBy({ id: Number(params.songId) });
    if (!song) error(404, 'Song not found');

    await songs.remove(song);
    return json({ ok: true });
}) satisfies RequestHandler;
