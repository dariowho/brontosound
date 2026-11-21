import { error } from '@sveltejs/kit';
import type { DeepPartial } from 'typeorm';
import TypeOrm from '$lib/db';
import { InteractionSender, LiveGig, LiveGigInteraction, LiveGigStatus, LiveVenue, LiveVenueLink, LiveVenueLinkSource, type MoneyAmount } from '$lib/dbEntities/live';
import { LocationLinkType } from '$lib/dbEntities/location';
import type { User } from '$lib/dbEntities/user';
import { PLACE_PAGE_LABELS } from '$lib/maps/place';
import { safeUrl } from '$lib/safeUrl';
import { date, existingId, list, oneOf, optionalText, text } from './input';

// What the live endpoints save, built from the request field by field (see input.ts). Authorship is the server's;
// a venue's location and links can only be its own.

const LOCATION_FIELDS = ['latitude', 'longitude', 'formattedAddress', 'poiName', 'googlemapsPlaceId', 'street', 'streetNumber', 'city', 'postalCode', 'country'] as const;
const URL_LINKS = [LocationLinkType.WEBSITE, ...Object.keys(PLACE_PAGE_LABELS)];

type Body = Record<string, any>;

/** id and authorship: an update keeps `createdBy`, a new row gets the user */
function authored(id: number | null, user: User) {
    const author = { id: user.id } as User;
    return id === null ? { createdBy: author, lastModifiedBy: author } : { id, lastModifiedBy: author };
}

export async function venueInput(body: Body, user: User): Promise<DeepPartial<LiveVenue>> {
    const existing = body.id === undefined ? null
        : await (await TypeOrm.getRepository(LiveVenue)).findOneBy({ id: await existingId(LiveVenue, body.id, 'venue') });
    const venue: DeepPartial<LiveVenue> = authored(existing?.id ?? null, user);

    if ('name' in body) venue.name = text(body.name, 'name');
    if ('note' in body) venue.note = text(body.note, 'note');
    if ('location' in body) {
        venue.location = body.location && {
            ...Object.fromEntries(LOCATION_FIELDS.filter(field => field in body.location).map(field => [field, body.location[field]])),
            id: existing?.location?.id, // the venue's own location, or a new one
        };
    }
    if ('links' in body) {
        const ownLinkIds = new Set(existing?.links?.map(link => link.id));
        venue.links = list(body.links, 'links').map(link => linkInput(link as Body, ownLinkIds, user));
    }
    if (!existing && !venue.name) error(400, 'A venue needs a name');
    return venue;
}

function linkInput(body: Body, ownLinkIds: Set<number>, user: User): DeepPartial<LiveVenueLink> {
    const type = oneOf(body.type, LocationLinkType, 'type');
    const value = text(body.value, 'value');
    if (URL_LINKS.includes(type) && !safeUrl(value)) error(400, `Not a web address: ${value}`);
    return {
        ...authored(ownLinkIds.has(body.id) ? body.id : null, user), // another venue's link id becomes a new link
        type, value,
        source: oneOf(body.source, LiveVenueLinkSource, 'source'),
        customLabel: optionalText(body.customLabel, 'customLabel'),
        note: optionalText(body.note, 'note'),
        hidden: body.hidden === true,
    };
}

/** A gig to create or update; `create` ignores any id */
export async function gigInput(body: Body, user: User, { create = false } = {}): Promise<DeepPartial<LiveGig>> {
    const id = !create && body.id !== undefined ? await existingId(LiveGig, body.id, 'gig') : null;
    const gig: DeepPartial<LiveGig> = authored(id, user);

    if ('name' in body) gig.name = text(body.name, 'name');
    if ('status' in body) gig.status = oneOf(body.status, LiveGigStatus, 'status');
    if ('date' in body) gig.date = date(body.date, 'date');
    if ('note' in body) gig.note = optionalText(body.note, 'note') as string;
    for (const field of ['proposedCachet', 'agreedCachet', 'ReceivedCachet'] as const) {
        if (field in body) gig[field] = money(body[field], field);
    }
    if ('venue' in body) gig.venue = { id: await existingId(LiveVenue, body.venue?.id, 'venue') };
    if (id === null && !(gig.name && gig.status && gig.date && gig.venue)) error(400, 'A gig needs a name, status, date and venue');
    return gig;
}

export async function interactionInput(body: Body, user: User): Promise<DeepPartial<LiveGigInteraction>> {
    return {
        ...authored(null, user),
        date: date(body.date, 'date'),
        note: optionalText(body.note, 'note') as string,
        from: oneOf(body.from, InteractionSender, 'from'),
        gig: { id: await existingId(LiveGig, body.gig?.id, 'gig') },
    };
}

/** An amount, or null to clear it (a cleared field sends `amount: null`) */
function money(value: unknown, field: string): MoneyAmount | null {
    const { amount, currency } = (value ?? {}) as Partial<MoneyAmount>;
    if (amount === null || amount === undefined) return null;
    if (typeof amount != 'number' || !Number.isFinite(amount) || typeof currency != 'string') error(400, `"${field}" must be an amount and a currency`);
    return { amount, currency };
}
