import { json, type RequestHandler } from '@sveltejs/kit';
import { findStoredSong, listSongFolder } from '$lib/server/songFolder';

/** List a folder in the song's folder: `path` is relative to it, empty for the song folder itself */
export const GET = (async ({ params, url }) => {
    const song = await findStoredSong(params.songId);
    return json(await listSongFolder(song, url.searchParams.get('path') ?? ''));
}) satisfies RequestHandler;
