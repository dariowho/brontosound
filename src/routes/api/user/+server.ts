import { createUser } from '$lib/server/users';
import { requirePermission } from '$lib/server/session';
import { json, type RequestHandler } from '@sveltejs/kit';
import { instanceToPlain } from 'class-transformer';

export const POST = (async ({ request, locals }) => {
    requirePermission(locals, 'users.manage');
    const user = await createUser(await request.json());
    return json(instanceToPlain(user));
}) satisfies RequestHandler;
