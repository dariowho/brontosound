import { error, type ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"
import { isValidId } from "$lib/server/session";
import { Song, type IndexedSongFolderData, SongIndex, SongNotFoundError } from "$lib/songs";

export function load({ params, url }: ServerLoadEvent) {
  if (! params.songId || ! isValidId(params.songId)) {
    throw error(400, "Invalid songId")
  }

  const storage = new FilesystemStorage('data/');
  const songIndex = new SongIndex(storage);
  let songFolder: IndexedSongFolderData;

  try {
   songFolder = songIndex.songById(params.songId);
  } catch (err) {
    if (err instanceof SongNotFoundError) {
        let folderName;
        if (folderName = url.searchParams.get('folderName')) {
           songFolder = songIndex.initializeSongMetadata(params.songId, folderName);
        } else {
            throw error(404, "Song not found: " + params.songId);
        }
    }
    throw(err);
  }

  let song = new Song(storage, songFolder);

  const songFolders = songIndex.listSongs();
  let allTags: Set<string> = new Set();
  songFolders.forEach(songFolder => {
    if ("metadata" in songFolder) {
      songFolder.metadata.tags.forEach(tag => allTags.add(tag));
    }
  });

  const pageTitle = [songFolder.metadata.author, songFolder.metadata.title].filter(str => str).join(' - ');
  return {
    pageTitle: pageTitle,
    breadcrumb: [
        {title: "Songbook", href: "/app/songbook"},
        {title: pageTitle, href: "/app/songbook/"+params.songId},
    ],
    songFolder: songFolder,
    ytUrl: song.ytLink(),
    readme: song.readme(),
    chords: song.chords(),
    allTags: Array(...allTags)
  }
}