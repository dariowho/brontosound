import TypeOrm from "$lib/db";
import { LiveGig, LiveGigStatus, LiveVenue } from "$lib/dbEntities/live";
import { Not } from "typeorm";

export async function load() {
  const db = await TypeOrm.getDb();
  const [venueCount, pursuitCount] = await Promise.all([
    db.getRepository(LiveVenue).count(),
    db.getRepository(LiveGig).count({ where: { status: Not(LiveGigStatus.COMPLETE) } }), // as on the Gig pursuit page
  ]);

  return {
    pageTitle: "Live",
    breadcrumb: [{title: "Live", href: "/app/live"}],
    venueCount,
    pursuitCount,
  }
}
