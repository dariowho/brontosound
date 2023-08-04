import type { ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"

export function load({ }: ServerLoadEvent) {
  // TODO: check auth
  const storage = new FilesystemStorage('data/');
  const songFolders = storage.listSongs();
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