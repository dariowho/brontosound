import TypeOrm from '$lib/db';
import { LiveVenue } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';
import { requirePermission } from '$lib/server/session';

// TODO: this supports both creation and update -> move update to PATCH
export const POST = (async ({ request, locals }) => {
    requirePermission(locals, 'live.write');
    const saveResult = await TypeOrm.saveEntity(LiveVenue, request.json(), {"lastModifiedBy": locals['brontoSession'].user});

    const newVenue = await (await TypeOrm.getRepository(LiveVenue)).findOneOrFail({where: {id: saveResult.id}, relations: { gigs: true }});

    return new Response(JSON.stringify(instanceToPlain(newVenue)));    
}) satisfies RequestHandler;
