import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/session';

/** Change the song's title and artist. Its folder in storage keeps its name. */
export const PATCH = (async ({ params, request, locals }) => {
    requirePermission(locals, 'songbook.write');
    const songs = (await TypeOrm.getDb()).getRepository(Song);
    const song = await songs.findOneBy({ id: Number(params.songId) });
    if (!song) error(404, 'Song not found');

    const { title, artist } = await request.json();
    if (typeof title != 'string' || !title.trim()) error(400, 'The title is required');
    if (typeof artist != 'string') error(400, 'The artist must be text');

    await songs.update(song.id, { title: title.trim(), artist: artist.trim() });
    return json({ title: title.trim(), artist: artist.trim() });
}) satisfies RequestHandler;

/** Permanently delete a song from the Songbook. Its folder in storage, if any, is left untouched. */
export const DELETE = (async ({ params, locals }) => {
    requirePermission(locals, 'songbook.write');
    const songs = (await TypeOrm.getDb()).getRepository(Song);
    const song = await songs.findOneBy({ id: Number(params.songId) });
    if (!song) error(404, 'Song not found');

    await songs.remove(song);
    return json({ ok: true });
}) satisfies RequestHandler;
