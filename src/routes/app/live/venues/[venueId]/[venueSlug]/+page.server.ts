import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveGig, LiveVenue } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";

export async function load({ params }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [venue] = await Promise.all([
    db.getRepository(LiveVenue).findOne({where: {id: parseInt(params.venueId)}, relations: ["gigs"]}),
  ]);
  // console.log("venues:", venues);

  return {
    pageTitle: "Venue: " + venue.name,
    breadcrumb: [{title: "Live", href: "/app/live"}, {title: "Venues", href: "/app/live/venues"}, {title: venue.name, href: `/app/live/venues/${params.venueId}/${params.venueSlug}`}],
    venue: instanceToPlain(venue),
  }
}

import type { Actions } from './$types';

export const actions = {
    saveNewGig: async ({request}) => {
        const data = await request.formData();
        console.log("data:", data);
        const savedGig = await TypeOrm.saveEntity(LiveGig, data.get("newGigJson"));
        return {
            success: true,
            savedGig: JSON.stringify(instanceToPlain(savedGig)),
        }
    },
} satisfies Actions;
