import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveGig, LiveVenue } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";

export async function load({ params }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [venue] = await Promise.all([
    db.getRepository(LiveVenue).findOne({where: {id: parseInt(params.venueId)}, relations: { gigs: true }}),
  ]);
  // console.log("venues:", venues);

  return {
    pageTitle: "Venue: " + venue.name,
    breadcrumb: [{title: "Live", href: "/app/live"}, {title: "Venues", href: "/app/live/venues"}, {title: venue.name, href: `/app/live/venues/${params.venueId}/${params.venueSlug}`}],
    venue: instanceToPlain(venue),
  }
}

import type { Actions } from './$types';
import { requirePermission } from '$lib/server/session';
import { gigInput } from '$lib/server/liveInput';
import { parseJson } from '$lib/server/input';

export const actions = {
    saveNewGig: async ({request, locals}) => {
        const { user } = requirePermission(locals, 'live.write');
        const data = await request.formData();
        const newGig = await gigInput(parseJson(data.get("newGigJson"), "newGigJson"), user, { create: true });
        const savedGig = await (await TypeOrm.getRepository(LiveGig)).save(newGig);
        return {
            success: true,
            savedGig: JSON.stringify(instanceToPlain(savedGig)),
        }
    },
} satisfies Actions;
