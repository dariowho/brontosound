import { removeUser } from '$lib/server/users';
import { requirePermission } from '$lib/server/session';
import { error, type RequestHandler } from '@sveltejs/kit';

export const DELETE = (async ({ params, locals }) => {
    const brontoSession = requirePermission(locals, 'users.manage');
    const userId = parseInt(params.userId ?? '');
    if (userId === brontoSession.user.id) {
        error(400, "You can't remove yourself");
    }
    await removeUser(userId);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler;
