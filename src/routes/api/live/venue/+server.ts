import TypeOrm from '$lib/db';
import { LiveVenue } from '$lib/dbEntities/live';
import type { RequestHandler } from '@sveltejs/kit';
import { instanceToPlain, plainToClass, Type } from 'class-transformer';

export const POST = (async ({ request }) => {
    const newVenue = await TypeOrm.saveEntity(LiveVenue, request.json());
    return new Response(JSON.stringify(instanceToPlain(newVenue)));
}) satisfies RequestHandler;
