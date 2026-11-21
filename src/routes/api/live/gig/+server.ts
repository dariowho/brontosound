import TypeOrm from '$lib/db';
import { LiveGig } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';
import { requirePermission } from '$lib/server/session';
import { gigInput } from '$lib/server/liveInput';

/** Create a gig, or update the fields sent (with an `id`) */
export const POST = (async ({ request, locals }) => {
    const { user } = requirePermission(locals, 'live.write');
    const gigs = await TypeOrm.getRepository(LiveGig);
    const { id } = await gigs.save(await gigInput(await request.json(), user));
    return new Response(JSON.stringify(instanceToPlain(await gigs.findOneOrFail({ where: { id }, relations: { venue: true, interactions: true } }))));
}) satisfies RequestHandler;
