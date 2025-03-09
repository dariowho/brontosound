import type { User } from '$lib/dbEntities/user'
import type { Session } from '@auth/sveltekit'
import slugify from 'slugify'

export interface BrontoSession {
    user: User,
    auth: Session,
    permissions: string[],
}

export function isValidId(slug: string): boolean {
    return slugify(slug) == slug
}