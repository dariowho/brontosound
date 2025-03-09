import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveVenue } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";

export async function load({ params }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [venue] = await Promise.all([
    db.getRepository(LiveVenue).findOneBy({id: parseInt(params.venueId)}),
  ]);
  // console.log("venues:", venues);

  return {
    pageTitle: "Venue: " + venue.name,
    breadcrumb: [{title: "Live", href: "/app/live"}, {title: "Venues", href: "/app/live/venues"}, {title: venue.name, href: `/app/live/venues/${params.venueId}/${params.venueSlug}`}],
    venue: instanceToPlain(venue),
  }
}
