import { error, type ServerLoadEvent } from "@sveltejs/kit";

import { FilesystemStorage } from "$lib/storage"
import { isValidId } from "$lib/server/session";
import TypeOrm from "$lib/db";
import { Song, SongTag } from "$lib/dbEntities/song";
import { instanceToPlain } from "class-transformer";
import { StoredFile } from "$lib/dbEntities/storage";
import { SongFilenames, StoredSong } from "$lib/songbook";
import { readSettings } from "$lib/server/bandSettings";

export async function load({ params, url }: ServerLoadEvent) {
  if (! params.songId || ! isValidId(params.songId)) {
    error(400, "Invalid songId");
  }

  const db = await TypeOrm.getDb();
  const songs = db.getRepository(Song);
  const files = db.getRepository(StoredFile);
  const tags = db.getRepository(SongTag);
  const song = await songs.findOne({where: {id: parseInt(params.songId)}, relations: ["tags"]});
  const storedSong = new StoredSong(song, readSettings().songsFolder);
  const [readme, chords, allTags] = await Promise.all([
    files.findOne({where: {path: storedSong.buildPath(SongFilenames.README)}}),
    files.findOne({where: {path: storedSong.buildPath(SongFilenames.CHORDS)}}),
    tags.find()
  ]);
  // console.log(chords);

  if (!song) {
    error(404, "Song not found!");
  }

  let pageTitle = `Song: ${song.title}`;
  // if (song.artist && song.artist != '') pageTitle.concat(` (${song.artist})`);
  return {
    pageTitle: pageTitle,
    breadcrumb: [
        {title: "Songbook", href: "/app/songbook"},
        {title: pageTitle, href: `/app/songbook/${params.songId}/${params.songSlug}`},
    ],
    song: instanceToPlain(storedSong),
    readmeFile: instanceToPlain(readme),
    chordsFile: instanceToPlain(chords),
    allTags: allTags.map((v) => v.name),
  }
}