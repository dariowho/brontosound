import type { ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"
import { SongIndex } from "$lib/songs";

export function load({ }: ServerLoadEvent) {
  // TODO: check auth
  const storage = new FilesystemStorage('data/persistedFilesystem');
  const songIndex = new SongIndex(storage);
  const songFolders = songIndex.listSongs();
  let allTags: Set<string> = new Set();
  songFolders.forEach(songFolder => {
    if ("metadata" in songFolder) {
      songFolder.metadata.tags.forEach(tag => allTags.add(tag));
    }
  });


  return {
    pageTitle: "Songbook",
    breadcrumb: [{title: "Songbook", href: "/app/songbook"}],
    songs: songFolders,
    allTags: allTags
  }
} 