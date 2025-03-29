import TypeOrm from '$lib/db';
import { LiveVenue } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';

export const POST = (async ({ request, locals }) => {
    const newVenue = await TypeOrm.saveEntity(LiveVenue, request.json(), {"createdBy": locals['brontoSession'].user});
    return new Response(JSON.stringify(instanceToPlain(newVenue)));
}) satisfies RequestHandler;
