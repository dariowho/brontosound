import { LocationLinkType } from '$lib/dbEntities/location';
import { fetchJson, newLocation, placeLinks, SEARCH_LIMIT, type Place, type SearchArea } from '$lib/maps/place';
import type { TileProvider } from './tileProvider';

/** HERE: Raster Tile API v3 for the map, Geocoding and Search API v7 (/discover) for places. */
export function here(apiKey: string): TileProvider {
    return {
        tiles: {
            // 512px tiles, one zoom level below Leaflet's 256px grid: a quarter of the (billed) tile requests
            url: `https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/png?style=explore.day&size=512&apiKey=${apiKey}`,
            options: { tileSize: 512, zoomOffset: -1, maxZoom: 20, attribution: `&copy; ${new Date().getFullYear()} HERE` },
        },
        search: (query, area) => searchHere(apiKey, query, area),
    };
}

type HereContactKind = 'www' | 'phone' | 'email';

/** The parts of a /discover item we use: https://docs.here.com/geocoding-and-search/reference/get_discover */
type HereItem = {
    id: string,
    title: string,
    position: { lat: number, lng: number },
    address: { label: string, street?: string, houseNumber?: string, city?: string, postalCode?: string, countryName?: string },
    contacts?: Partial<Record<HereContactKind, { value: string }[]>>[],
};

async function searchHere(apiKey: string, query: string, area: SearchArea): Promise<Place[]> {
    const url = new URL('https://discover.search.hereapi.com/v1/discover');
    url.search = new URLSearchParams({
        q: query,
        at: `${area.center.lat},${area.center.lng}`,
        limit: String(SEARCH_LIMIT),
        apiKey,
    }).toString();
    const { items } = await fetchJson<{ items: HereItem[] }>(url);
    return items.map(toPlace);
}

function toPlace(item: HereItem): Place {
    const { address } = item;
    return {
        location: newLocation({
            latitude: item.position.lat,
            longitude: item.position.lng,
            poiName: item.title,
            formattedAddress: address.label,
            street: address.street,
            streetNumber: address.houseNumber,
            city: address.city,
            postalCode: address.postalCode,
            country: address.countryName,
        }),
        links: [
            { type: LocationLinkType.HERE_WEGO_URL, value: `https://wego.here.com/p/${item.id}` },
            ...placeLinks({
                website: firstContact(item, 'www'),
                phone: firstContact(item, 'phone'),
                email: firstContact(item, 'email'),
            }),
        ],
    };
}

function firstContact(item: HereItem, kind: HereContactKind): string | undefined {
    return item.contacts?.flatMap(contact => contact[kind] ?? [])[0]?.value;
}
