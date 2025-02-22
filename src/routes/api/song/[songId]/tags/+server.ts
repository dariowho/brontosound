import { isValidId } from '$lib/server/session';
import { Song, type IndexedSongFolderData, SongIndex, SongNotFoundError } from '$lib/songs';
import { FilesystemStorage } from '$lib/storage';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET = (({ url }) => {
    return new Response(`Error`);
}) satisfies RequestHandler;

export interface PostTagsRequest {
    tags: string[]
}

/**
 * Create a new prompt record in database
 */
export const POST = (async ({ request, params }) => {
    if (! params.songId || ! isValidId(params.songId)) {
        error(400, "Invalid songId");
    }

    const storage = new FilesystemStorage('data/');
    let songFolder: IndexedSongFolderData;
    let songIndex = new SongIndex(storage);

    try {
        songFolder = songIndex.songById(params.songId);
    } catch (err) {
    if (err instanceof SongNotFoundError) {
        error(404, "Song not found: " + params.songId);
    }
        throw(err);
    }

    let song = new Song(storage, songFolder);

    const postTagsRequest: PostTagsRequest = await request.json();
    song.writeTags(postTagsRequest.tags);

    return new Response(JSON.stringify({}));
}) satisfies RequestHandler;
