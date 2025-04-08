import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveGig, LiveGigStatus, LiveVenue } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";
import { Not } from "typeorm";

export async function load({ }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [pursuitGigs] = await Promise.all([
    db.getRepository(LiveGig).find({where: {status: Not(LiveGigStatus.COMPLETE)}, relations: ['venue']}),
  ]);
  // console.log("pursuitGigs:", pursuitGigs);

  return {
    pageTitle: "Gig Pursuit",
    breadcrumb: [{title: "Live", href: "/app/live"}, {title: "Gig Pursuit", href: "/app/live/pursuit"}],
    pursuitGigs: pursuitGigs.map((gig) => instanceToPlain(gig)),
  }
}
