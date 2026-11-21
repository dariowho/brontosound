import { error, type RequestHandler } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/session';
import { findActiveUser } from '$lib/server/users';
import { resetTwoStep } from '$lib/server/twoStep';

/** Turns a user's two-step verification off, for a lost device: they sign in with their password alone, and can set it up again */
export const DELETE = (async ({ params, locals }) => {
    requirePermission(locals, 'users.manage');
    const user = await findActiveUser(parseInt(params.userId ?? ''));
    if (!user) error(404, 'User not found');
    await resetTwoStep(user.id);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler;
