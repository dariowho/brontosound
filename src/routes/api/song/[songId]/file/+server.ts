import { error, type RequestHandler } from '@sveltejs/kit';
import { findStoredSong, readSongFile } from '$lib/server/songFolder';

/** Stream a file of the song's folder (`path` relative to it). With `download`, the browser saves it. */
export const GET = (async ({ params, url }) => {
    const path = url.searchParams.get('path');
    if (!path) error(400, "Path parameter is required");

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
