import { error, type ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"
import { isValidId } from "$lib/server/session";

export function load({ params, url }: ServerLoadEvent) {
  if (! params.songId || ! isValidId(params.songId)) {
    error(400, "Invalid songId");
  }

  const pageTitle = "🚧 MOCK Song Title (this page is under development)";
  return {
    pageTitle: pageTitle,
    breadcrumb: [
        {title: "Songbook", href: "/app/songbook"},
        {title: pageTitle, href: "/app/songbook/"+params.songId},
    ],
    ytUrl: {url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", id: "dQw4w9WgXcQ"},
    readme: "THIS IS A MOCK README - https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    chords: null,
    allTags: ['mock-tag-1', 'mock-tag-2'],
  }
}