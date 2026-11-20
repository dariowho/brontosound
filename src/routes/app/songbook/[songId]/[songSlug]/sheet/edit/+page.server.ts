import type { Actions } from './$types';
import { writeTextFile } from "$lib/server/cachedStorage";
import { instanceToPlain } from "class-transformer";
import { findStoredSong } from "$lib/server/songFolder";
import { SongFilenames } from "$lib/songbook";
import { requirePermission } from '$lib/server/session';

export const actions = {
    save: async ({request, params, locals}) => {
        requirePermission(locals, 'songbook.write');
        const data = await request.formData();
        const path = (await findStoredSong(params.songId)).buildPath(SongFilenames.CHORDS);
        const newContent = data.get('editor')?.toString();
        if (newContent == null) return {
            success: false,
            message: "No content to write"
        }

        const file = await writeTextFile(path, newContent);
        return {
            success: true,
            file: instanceToPlain(file)
        }
    },
} satisfies Actions;