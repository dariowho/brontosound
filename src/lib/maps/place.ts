import { Location, LocationLinkType, type LocationLink } from '$lib/dbEntities/location';

export type LatLng = { lat: number, lng: number };

/** The visible map, so searches can prefer places near it. */
export type SearchArea = { center: LatLng, west: number, south: number, east: number, north: number };

export type PlaceLink = Pick<LocationLink, 'type' | 'value'>;

/** A place found on a map: the location to save on a venue, and the links found with it. */
export type Place = { location: Location, links: PlaceLink[] };

export type PlaceSearch = (query: string, area: SearchArea) => Promise<Place[]>;

export const DEFAULT_CENTER: LatLng = { lat: 45.468503, lng: 9.182403 }; // Milan
export const CITY_ZOOM = 12;
export const PLACE_ZOOM = 17;
export const SEARCH_LIMIT = 5;

/** Badge labels of the links to a place's page on a maps provider. Mapbox has no public place pages. */
export const PLACE_PAGE_LABELS: Partial<Record<LocationLinkType, string>> = {
    [LocationLinkType.GOOGLE_MAPS_URL]: 'Google Maps',
    [LocationLinkType.OPENSTREETMAP_URL]: 'OpenStreetMap',
    [LocationLinkType.HERE_WEGO_URL]: 'HERE WeGo',
};

export function newLocation(fields: Partial<Location>): Location {
    return Object.assign(new Location(), fields);
}

export function locationLatLng(location: Location): LatLng {
    return { lat: Number(location.latitude), lng: Number(location.longitude) };
}

/** Links from a place's contact details, skipping the missing ones. */
export function placeLinks(contacts: { website?: string, phone?: string, email?: string }): PlaceLink[] {
    const links: PlaceLink[] = [];
    if (contacts.website) links.push({ type: LocationLinkType.WEBSITE, value: contacts.website });
    if (contacts.phone) links.push({ type: LocationLinkType.PHONE_NUMBER, value: contacts.phone });
    if (contacts.email) links.push({ type: LocationLinkType.EMAIL, value: contacts.email });
    return links;
}

/** GET a provider's JSON API; throws with the HTTP status on failure. */
export async function fetchJson<T>(url: URL): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url.host} answered ${response.status} ${response.statusText}`);
    return response.json();
}
