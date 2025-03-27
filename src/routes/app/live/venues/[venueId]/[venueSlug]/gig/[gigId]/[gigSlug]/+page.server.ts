import type { ServerLoadEvent } from "@sveltejs/kit";

import TypeOrm from "$lib/db";
import { LiveGig, LiveGigInteraction } from "$lib/dbEntities/live";
import { instanceToPlain } from "class-transformer";

export async function load({ params }: ServerLoadEvent) {
  let db = await TypeOrm.getDb()
  const [gig] = await Promise.all([
    db.getRepository(LiveGig).findOne({where: {id: parseInt(params.gigId)}, relations: ["venue", "interactions"]}),
  ]);
  // console.log("gig:", gig);

  if (!gig) {
    error(404, "Gig not found!");
  }

  return {
    pageTitle: "Gig: " + gig.name,
    breadcrumb: [
      {title: "Live", href: "/app/live"},
      {title: "Venues", href: "/app/live/venues"},
      {title: gig.venue.name, href: `/app/live/venues/${params.venueId}/${params.venueSlug}`},
      {title: `Gig: ${gig.name}`, href: `/app/live/venues/${params.venueId}/${params.venueSlug}`}
    ],
    gig: instanceToPlain(gig),
  }
}

import type { Actions } from './$types';
import { error } from "console";

export const actions = {
    saveNewInteraction: async ({request, locals}) => {
        const data = await request.formData();
        console.log("data:", data);

        const savedInteraction = await TypeOrm.saveEntity(LiveGigInteraction, data.get("newInteractionJson"), {"createdBy": locals['brontoSession'].user});
        return {
            success: true,
            savedInteraction: JSON.stringify(instanceToPlain(savedInteraction)),
        }
    },
} satisfies Actions;
