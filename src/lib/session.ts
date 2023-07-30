export interface BrontoSession {
    username: string,
    accessToken: string
}

export function isValidSession(brontoSession: BrontoSession) {
    return brontoSession.username && brontoSession.accessToken
}
