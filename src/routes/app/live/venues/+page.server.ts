import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveVenue } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";

export async function load({ }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [venues] = await Promise.all([
    db.getRepository(LiveVenue).find(),
  ]);
  // console.log("venues:", venues);

  return {
    pageTitle: "Venues",
    breadcrumb: [{title: "Live", href: "/app/live"}, {title: "Venues", href: "/app/live/venues"}],
    venues: venues.map((venue) => instanceToPlain(venue)),
  }
}
