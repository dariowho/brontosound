import { type ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { SongTag } from "$lib/dbEntities/song";
import { instanceToPlain } from "class-transformer";
import { StoredFile } from "$lib/dbEntities/storage";
import { SongFilenames } from "$lib/songbook";
import { findStoredSong } from "$lib/server/songFolder";

export async function load({ params }: ServerLoadEvent) {
  const storedSong = await findStoredSong(params.songId);

  const db = await TypeOrm.getDb();
  const files = db.getRepository(StoredFile);
  const [readme, chords, allTags] = await Promise.all([
    files.findOne({where: {path: storedSong.buildPath(SongFilenames.README)}}),
    files.findOne({where: {path: storedSong.buildPath(SongFilenames.CHORDS)}}),
    db.getRepository(SongTag).find()
  ]);

  return {
    pageTitle: `Song: ${storedSong.title}`,
    breadcrumb: [
        {title: "Songbook", href: "/app/songbook"},
        {title: storedSong.title, href: `/app/songbook/${params.songId}/${params.songSlug}`},
    ],
    song: instanceToPlain(storedSong),
    readmeFile: instanceToPlain(readme),
    chordsFile: instanceToPlain(chords),
    allTags: allTags.map((v) => v.name),
  }
}
