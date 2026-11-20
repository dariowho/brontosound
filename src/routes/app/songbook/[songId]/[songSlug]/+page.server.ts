import type { ServerLoadEvent } from "@sveltejs/kit";
import { findStoredSong, listSongFolder } from "$lib/server/songFolder";
import type { SongFile } from "$lib/songFiles/songFile";
import { soundfontChoice } from "$lib/server/soundfonts";

export async function load({ params, locals }: ServerLoadEvent) {
  const song = await findStoredSong(params.songId);

  // The page still opens when storage can't be read, and says so
  let rootFiles: SongFile[] = [];
  let folderError: string | null = null;
  try {
    rootFiles = await listSongFolder(song, '');
  } catch (e: any) {
    folderError = e?.body?.message ?? e?.message ?? String(e);
  }

  return {
    pageTitle: null, // the page renders its own title, with tags and actions
    rootFiles,
    folderError,
    soundfonts: await soundfontChoice(locals.brontoSession?.user),
  };
}
