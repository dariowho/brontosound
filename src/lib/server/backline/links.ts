import { createHash, randomBytes } from 'node:crypto';
import TypeOrm from '$lib/db';
import { BacklineLink } from '$lib/dbEntities/backline';
import type { User } from '$lib/dbEntities/user';
import { dropHost } from '$lib/server/backline/liveSession';

// Tokens are long and random, so a plain hash is enough to store them
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

// Linking, started from Backline: it makes up a request id and opens /backline/link with it; the user confirms
// there; Backline, asking every few seconds, then gets its token, once
const LINK_REQUEST_MS = 10 * 60 * 1000;
const confirmedLinks = new Map<string, { token: string, expires: number }>();

export function isLinkRequest(request: unknown): request is string {
    return typeof request === 'string' && /^[0-9a-f]{32}$/.test(request);
}

/** Links the Backline that made `request` to `userId` */
export async function confirmLink(request: string, userId: number): Promise<void> {
    const token = randomBytes(24).toString('base64url');
    const links = await TypeOrm.getRepository(BacklineLink);
    await links.save(links.create({ tokenHash: hashToken(token), createdBy: { id: userId } }));
    confirmedLinks.set(request, { token, expires: Date.now() + LINK_REQUEST_MS });
}

/** The token for a confirmed request, handed out once; null while it is not confirmed */
export function claimLink(request: string): string | null {
    const now = Date.now();
    confirmedLinks.forEach((link, key) => link.expires < now && confirmedLinks.delete(key));
    const link = confirmedLinks.get(request);
    confirmedLinks.delete(request);
    return link?.token ?? null;
}

export async function listLinks(userId: number): Promise<{ id: number, creationDate?: Date }[]> {
    const links = await (await TypeOrm.getRepository(BacklineLink)).findBy({ createdBy: { id: userId } });
    return links.map(({ id, creationDate }) => ({ id, creationDate }));
}

export async function removeLink(userId: number, id: number): Promise<void> {
    const links = await TypeOrm.getRepository(BacklineLink);
    const link = await links.findOneBy({ id, createdBy: { id: userId } });
    if (link) {
        await links.remove(link);
        dropHost(link.tokenHash);
    }
}

/** The active user a Backline's token belongs to */
export async function findLinkedUser(token: string): Promise<User | null> {
    const link = await (await TypeOrm.getRepository(BacklineLink)).findOneBy({ tokenHash: hashToken(token) });
    return link?.createdBy && !link.createdBy.removedDate ? link.createdBy : null;
}
