import TypeOrm from '$lib/db';
import { Song, SongTag } from '$lib/dbEntities/song';
import { isValidId } from '$lib/server/session';
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
    const songId = parseInt(params.songId);
    const [postTagRequest, db] = await Promise.all([
        await request.json() as PostTagsRequest,
        await TypeOrm.getDb(),
    ]);
    const songTagRepository = db.getRepository(SongTag);

    // Find or create tags - Gemini generated - TODO: optimize
    const tags: SongTag[] = [];
    for (const tagName of postTagRequest.tags) {
        let tag = await songTagRepository.findOne({ where: { name: tagName } });
        if (!tag) {
            tag = songTagRepository.create({ name: tagName });
            await songTagRepository.save(tag);
        }
        tags.push(tag);
    }

    const updatedSong = await db.getRepository(Song).save({
        id: songId,
        tags: tags
    })
    console.log(updatedSong);

    return new Response(JSON.stringify(updatedSong));
}) satisfies RequestHandler;
