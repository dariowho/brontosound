import { LocationLinkType } from '$lib/dbEntities/location';
import { fetchJson, newLocation, placeLinks, SEARCH_LIMIT, type Place, type SearchArea } from '$lib/maps/place';
import type { TileProvider } from './tileProvider';

const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * OpenStreetMap: any XYZ tile server for the map, any Nominatim server for places.
 * Both are open source and can be self-hosted; public servers have usage policies (docs/maps.md).
 */
export function openStreetMap(tileServer: string, nominatimServer?: string): TileProvider {
    return {
        tiles: { url: tileServer, options: { maxZoom: 19, attribution: ATTRIBUTION } },
        search: nominatimServer ? (query, area) => searchNominatim(nominatimServer, query, area) : null,
    };
}

/** The parts of a Nominatim result we use: https://nominatim.org/release-docs/latest/api/Search/ */
type NominatimResult = {
    osm_type: 'node' | 'way' | 'relation',
    osm_id: number,
    lat: string,
    lon: string,
    name: string,
    display_name: string,
    address: {
        road?: string,
        house_number?: string,
        city?: string,
        town?: string,
        village?: string,
        postcode?: string,
        country?: string,
    },
    extratags: Record<string, string> | null,
};

async function searchNominatim(server: string, query: string, area: SearchArea): Promise<Place[]> {
    const url = new URL('search', server.endsWith('/') ? server : `${server}/`);
    url.search = new URLSearchParams({
        q: query,
        viewbox: `${area.west},${area.south},${area.east},${area.north}`, // preferred, not a limit
        format: 'jsonv2',
        addressdetails: '1',
        extratags: '1',
        limit: String(SEARCH_LIMIT),
    }).toString();
    const results = await fetchJson<NominatimResult[]>(url);
    return results.map(toPlace);
}

function toPlace(result: NominatimResult): Place {
    const { address } = result;
    const tags = result.extratags ?? {};
    return {
        location: newLocation({
            latitude: Number(result.lat),
            longitude: Number(result.lon),
            poiName: result.name || undefined,
            formattedAddress: result.display_name,
            street: address.road,
            streetNumber: address.house_number,
            city: address.city ?? address.town ?? address.village,
            postalCode: address.postcode,
            country: address.country,
        }),
        links: [
            // The OSM object's page: its map outline, name and tags
            { type: LocationLinkType.OPENSTREETMAP_URL, value: `https://www.openstreetmap.org/${result.osm_type}/${result.osm_id}` },
            ...placeLinks({
                website: tags.website ?? tags['contact:website'],
                phone: tags.phone ?? tags['contact:phone'],
                email: tags.email ?? tags['contact:email'],
            }),
        ],
    };
}
