import type { User } from '$lib/dbEntities/user'
import type { Session } from '@auth/sveltekit'
import { error } from '@sveltejs/kit'
import slugify from 'slugify'

export interface BrontoSession {
    user: User,
    auth: Session,
    permissions: string[],
}

// Routes open to visitors: every other route needs a signed-in user. `/backline` checks access itself.
const PUBLIC_ROUTES = ['/', '/signin', '/signout'];

/**
 * Whether visitors may reach a route, by its id: the route SvelteKit matched, not the URL, which may be
 * percent-encoded (`/%61pi/…` matches `/api/…`). No route (a 404) has nothing to guard.
 */
export function isPublicRoute(routeId: string | null): boolean {
    return routeId === null || PUBLIC_ROUTES.includes(routeId) || routeId === '/backline' || routeId.startsWith('/backline/');
}

export const isApiRoute = (routeId: string | null) => !!routeId?.startsWith('/api/');

export function isValidId(slug: string): boolean {
    return slugify(slug) == slug
}

export function requirePermission(locals: App.Locals, permission: string): BrontoSession {
    const brontoSession: BrontoSession | null = locals['brontoSession'];
    if (!brontoSession?.permissions.includes(permission)) {
        error(403, 'Forbidden');
    }
    return brontoSession;
}
