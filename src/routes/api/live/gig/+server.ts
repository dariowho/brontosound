import TypeOrm from '$lib/db';
import { LiveGig } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';
import { requirePermission } from '$lib/server/session';

// TODO: this supports both creation and update -> move update to PATCH
export const POST = (async ({ request, locals }) => {
    requirePermission(locals, 'live.write');
    const saveResult = await TypeOrm.saveEntity(LiveGig, request.json(), {"lastModifiedBy": locals['brontoSession'].user});

    const newGig = await (await TypeOrm.getRepository(LiveGig)).findOneOrFail({where: {id: saveResult.id}, relations: { venue: true, interactions: true }});

    return new Response(JSON.stringify(instanceToPlain(newGig)));    
}) satisfies RequestHandler;
