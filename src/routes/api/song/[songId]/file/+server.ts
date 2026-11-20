import { error, json, type RequestHandler } from '@sveltejs/kit';
import TypeOrm from '$lib/db';
import { Song } from '$lib/dbEntities/song';
import { deleteSongFile, findStoredSong, readSongFile, writeSongFile } from '$lib/server/songFolder';
import type { SongPins } from '$lib/songFiles/songFile';
import { requirePermission } from '$lib/server/session';

/** Files of the song's folder, addressed by `path` relative to it */
function pathParam(url: URL): string {
    const path = url.searchParams.get('path');
    if (!path) error(400, "Path parameter is required");
    return path;
}

/** Stream a file. With `download`, the browser saves it. */
export const GET = (async ({ params, url }) => {
    const path = pathParam(url);
    const song = await findStoredSong(params.songId);
    const file = await readSongFile(song, path);
    const name = encodeURIComponent(path.split('/').pop()!);
    return new Response(file.stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(file.size),
            'Content-Disposition': `${url.searchParams.has('download') ? 'attachment' : 'inline'}; filename*=UTF-8''${name}`,
        },
    });
}) satisfies RequestHandler;

/** Upload a new file, the request body as is: a file already there is a 409 */
export const POST = (async ({ params, url, request, locals }) => {
    requirePermission(locals, 'songbook.write');
    await writeSongFile(await findStoredSong(params.songId), pathParam(url), new Uint8Array(await request.arrayBuffer()), false);
    return json({ ok: true });
}) satisfies RequestHandler;

/** Save a file, replacing it */
export const PUT = (async ({ params, url, request, locals }) => {
    requirePermission(locals, 'songbook.write');
    await writeSongFile(await findStoredSong(params.songId), pathParam(url), new Uint8Array(await request.arrayBuffer()), true);
    return json({ ok: true });
}) satisfies RequestHandler;

/** Delete a file, and unpin it. Returns the pins. */
export const DELETE = (async ({ params, url, locals }) => {
    requirePermission(locals, 'songbook.write');
    const path = pathParam(url);
    const song = await findStoredSong(params.songId);
    await deleteSongFile(song, path);

    const pins: SongPins = {
        pinnedDocument: song.pinnedDocument == path ? null : song.pinnedDocument,
        pinnedAudio: song.pinnedAudio == path ? null : song.pinnedAudio,
    };
    await (await TypeOrm.getDb()).getRepository(Song).update(song.id, pins);
    return json(pins);
}) satisfies RequestHandler;
