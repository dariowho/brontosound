import TypeOrm from '$lib/db';
import { LiveVenue } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';

// TODO: this supports both creation and update -> move update to PATCH
export const POST = (async ({ request, locals }) => {
    const saveResult = await TypeOrm.saveEntity(LiveVenue, request.json(), {"lastModifiedBy": locals['brontoSession'].user});

    const newVenue = await (await TypeOrm.getRepository(LiveVenue)).findOneOrFail({where: {id: saveResult.id}, relations: ['gigs']});

    return new Response(JSON.stringify(instanceToPlain(newVenue)));    
}) satisfies RequestHandler;
