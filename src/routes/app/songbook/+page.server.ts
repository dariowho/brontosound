import type { ServerLoadEvent } from "@sveltejs/kit";

import {instanceToPlain} from "class-transformer"

import { Song } from "$lib/dbEntities/song";
import TypeOrm from "$lib/db";
import { StoredDirectory } from "$lib/dbEntities/storage";
import { readSettings } from "$lib/server/bandSettings";

export async function load({ }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [songs, cachedStoredDirs] = await Promise.all([
    db.getRepository(Song).find({ relations: ["tags"] }),
    db.getRepository(StoredDirectory).find({where: {parentPath: readSettings().songsFolder}})
  ]);
  // console.log("songs:", songs);
  // console.log("cachedStoredDirs:", cachedStoredDirs);

  const lastSync = cachedStoredDirs.reduce<Date | null>((oldest, dir) => {
    return !oldest || dir.lastVisited < oldest ? dir.lastVisited : oldest;
  }, null);

  return {
    pageTitle: "Songbook",
    breadcrumb: [{title: "Songbook", href: "/app/songbook"}],
    songs: songs.map((song) => instanceToPlain(song)),
    cachedStoredDirs: cachedStoredDirs.map((dir) => instanceToPlain(dir)),
    lastCacheSync: lastSync,
    allTags: [] // TODO: implement
  }
}
