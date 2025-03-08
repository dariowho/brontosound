import type { ServerLoadEvent } from "@sveltejs/kit";

// export function load({ cookies, url }: ServerLoadEvent) {

// }

import type { Actions } from './$types';
import { FilesystemStorage } from "$lib/storage";
import { Song, type IndexedSongFolderData, SongIndex } from "$lib/songs";

export const actions = {
    save: async ({request, params}) => {
        const data = await request.formData();
        const newContent = data.get('editor')?.toString();
        if (newContent == null) return {
            success: false,
            message: "No content to write"
        }

        const storage = new FilesystemStorage('data/persistedFilesystem');
        const songIndex = new SongIndex(storage);
        let songFolder: IndexedSongFolderData = songIndex.songById(params.songId); // TODO: sanitize?
        let song = new Song(storage, songFolder);
        song.writeChords(newContent);
        return {
            success: true
        }
    },
} satisfies Actions;