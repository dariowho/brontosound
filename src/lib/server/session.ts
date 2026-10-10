import type { User } from '$lib/dbEntities/user'
import type { Session } from '@auth/sveltekit'
import { error } from '@sveltejs/kit'
import slugify from 'slugify'

export interface BrontoSession {
    user: User,
    auth: Session,
    permissions: string[],
}

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
