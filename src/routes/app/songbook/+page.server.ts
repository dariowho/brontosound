import type { ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"

export function load({ }: ServerLoadEvent) {
  // TODO: check auth
  const storage = new FilesystemStorage('data/');
  return {
    pageTitle: "Songbook",
    breadcrumb: [{title: "Songbook", href: "/app/songbook"}],
    songs: storage.listSongs()
  }
} 