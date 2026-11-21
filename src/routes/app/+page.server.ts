import TypeOrm from "$lib/db";
import { LiveGig, LiveGigStatus, LiveVenue } from "$lib/dbEntities/live";
import { Song, SongTag } from "$lib/dbEntities/song";
import { StoredDirectory } from "$lib/dbEntities/storage";
import { buildGigUrl } from "$lib/misc";
import { readSettings } from "$lib/server/bandSettings";
import { reconcileSongs } from "$lib/songbook";
import { MoreThanOrEqual, Not } from "typeorm";

export async function load() {
  const db = await TypeOrm.getDb();
  const [songs, songDirs, tagCount, venueCount, pursuitCount, upcomingGigs] = await Promise.all([
    db.getRepository(Song).find(),
    db.getRepository(StoredDirectory).find({ where: { parentPath: readSettings().songsFolder } }),
    db.getRepository(SongTag).count(),
    db.getRepository(LiveVenue).count(),
    db.getRepository(LiveGig).count({ where: { status: Not(LiveGigStatus.COMPLETE) } }), // as on the Gig pursuit page
    db.getRepository(LiveGig).find({
      where: { status: LiveGigStatus.CONFIRMED, date: MoreThanOrEqual(new Date()) },
      order: { date: 'ASC' },
      relations: { venue: true },
    }),
  ]);

  const { existing, newDirs } = reconcileSongs(songs, songDirs);
  const lastAdded = existing.reduce<Date | null>((last, song) => !last || song.creationDate > last ? song.creationDate : last, null);
  const nextGig = upcomingGigs[0];

  return {
    pageTitle: "Dashboard",
    breadcrumb: [],
    songbook: { songCount: existing.length, tagCount, lastAdded, newSongCount: newDirs.length },
    live: {
      venueCount,
      pursuitCount,
      upcomingGigCount: upcomingGigs.length,
      nextGig: nextGig?.venue && { venueName: nextGig.venue.name, date: nextGig.date, url: buildGigUrl(nextGig, nextGig.venue) },
    },
  };
}
