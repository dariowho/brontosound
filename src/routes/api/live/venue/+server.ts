import TypeOrm from '$lib/db';
import { LiveVenue } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';
import { requirePermission } from '$lib/server/session';
import { venueInput } from '$lib/server/liveInput';

/** Create a venue, or update the fields sent (with an `id`) */
export const POST = (async ({ request, locals }) => {
    const { user } = requirePermission(locals, 'live.write');
    const venues = await TypeOrm.getRepository(LiveVenue);
    const { id } = await venues.save(await venueInput(await request.json(), user));
    return new Response(JSON.stringify(instanceToPlain(await venues.findOneOrFail({ where: { id }, relations: { gigs: true } }))));
}) satisfies RequestHandler;
