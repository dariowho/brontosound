// The band's live session: the one Backline app that announced its Live page, and the browsers watching it on /backline.
// Kept in memory. This server only decides who gets in and passes messages along: it never reads them, and the
// page the browsers show is the one Backline sent (see docs/backline.md).

import { error } from '@sveltejs/kit';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Mailbox } from './mailbox';
import { readSettings } from '../bandSettings';

const GONE_MS = 45_000; // without a pull for this long, Backline or a browser is gone

/** What Backline receives: a browser joined, left, or sent message `m` */
type HostItem = { c: string, join?: string, leave?: true, m?: string };

interface Host {
    instance: string;  // names one run of the Backline app
    tokenHash: string; // of the link it signed in with
    public: boolean;   // anyone with the PIN gets in; else band members only
    pin: string;
    page: string;      // the HTML of its remote
    inbox: Mailbox<HostItem>;
    guests: Set<string>; // tokens of visitors who gave the PIN: they hold these, never the PIN
}

interface Client {
    name: string;
    inbox: Mailbox<string>;
}

let host: Host | null = null;
const clients = new Map<string, Client>();

function dropClients(): void {
    clients.forEach(client => client.inbox.release());
    clients.clear();
}

// Forgets whoever stopped pulling
function sweep(): void {
    const now = Date.now();
    if (host && now - host.inbox.lastPull > GONE_MS) {
        host = null;
        dropClients();
    }
    clients.forEach((client, id) => {
        if (now - client.inbox.lastPull > GONE_MS) {
            clients.delete(id);
            host?.inbox.push({ c: id, leave: true });
        }
    });
}

// ---- Backline's side ----

export interface Announcement {
    instance: string;
    tokenHash: string;
    public: boolean;
    pin: string;
    page: string;
}

/** Makes a Backline the live one. Another Backline that was live is kicked out, and so are its browsers */
export function announce(a: Announcement): { next: number, ice: string[] } {
    sweep();
    if (host?.instance !== a.instance) {
        host?.inbox.release();
        dropClients();
        host = { ...a, inbox: new Mailbox(), guests: new Set() };
    } else {
        if (a.pin !== host.pin) {
            host.guests.clear(); // a new PIN lets in only who knows it
        }
        Object.assign(host, a);
    }
    return { next: host.inbox.next, ice: readSettings().backlineStunServers };
}

/** The live Backline, if it is the one asking: 404 when none is live, 409 when another one took over */
export function hostFor(instance: string, tokenHash: string): Host {
    sweep();
    if (!host) {
        error(404, 'Not announced');
    }
    if (host.instance !== instance) {
        error(409, 'Another Backline took over');
    }
    if (host.tokenHash !== tokenHash) {
        error(401, 'Unknown token');
    }
    return host;
}

/** Messages from Backline to browsers */
export function toClients(items: { c: string, m: string }[]): void {
    for (const { c, m } of items) {
        clients.get(c)?.inbox.push(m);
    }
}

/** A link was removed: its Backline is no longer welcome */
export function dropHost(tokenHash: string): void {
    if (host?.tokenHash === tokenHash) {
        host.inbox.release();
        host = null;
        dropClients();
    }
}

// ---- The browsers' side ----

/** The live session as a visitor may know it, or null when no Backline is live */
export function liveBackline(): { public: boolean, page: string } | null {
    sweep();
    return host && { public: host.public, page: host.page };
}

/** Band members always get in; others with a guest token, when Backline shares publicly */
export function mayEnter(locals: App.Locals, guestToken: string | undefined): boolean {
    if (!host) {
        return false;
    }
    return !!locals.brontoSession || (host.public && !!guestToken && host.guests.has(guestToken));
}

/** A guest token for a visitor who gave the right PIN, when Backline shares publicly; else null */
export function admitGuest(pin: string): string | null {
    if (!host?.public || !isPin(pin)) {
        return null;
    }
    const token = randomBytes(24).toString('base64url');
    host.guests.add(token);
    return token;
}

function isPin(pin: string | undefined): boolean {
    const [given, expected] = [Buffer.from(pin ?? ''), Buffer.from(host?.pin ?? '')];
    return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected);
}

/** Seats a browser and tells Backline. Returns its id */
export function join(name: string): string {
    const id = randomBytes(8).toString('hex');
    clients.set(id, { name, inbox: new Mailbox() });
    host?.inbox.push({ c: id, join: name });
    return id;
}

/** A browser's mailbox: 410 when it is not seated (any more), so it joins again */
export function clientFor(id: string): Client {
    sweep();
    const client = clients.get(id);
    if (!client) {
        error(410, 'Join again');
    }
    return client;
}

/** Messages from a browser to Backline */
export function toHost(id: string, messages: string[]): void {
    for (const m of messages) {
        host?.inbox.push({ c: id, m });
    }
}
