import slugify from 'slugify'

export interface BrontoSession {
    username: string,
    accessToken: string
}

export function isValidSession(brontoSession: BrontoSession) {
    return brontoSession.username && brontoSession.accessToken
}

export function isValidId(slug: string): boolean {
    return slugify(slug) == slug
}