import { fetchJson, newLocation, placeLinks, SEARCH_LIMIT, type Place, type SearchArea } from '$lib/maps/place';
import type { TileProvider } from './tileProvider';

const STYLE = 'mapbox/streets-v12';

// Required with Mapbox tiles, with the logo: https://docs.mapbox.com/help/dive-deeper/attribution/
const ATTRIBUTION = '&copy; <a href="https://www.mapbox.com/about/maps">Mapbox</a> '
    + '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
    + '<strong><a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a></strong>';

/** Mapbox: Static Tiles API for the map, Search Box API for places. */
export function mapbox(token: string): TileProvider {
    return {
        tiles: {
            // 512px tiles, one zoom level below Leaflet's 256px grid; {r} asks for @2x tiles on retina screens
            url: `https://api.mapbox.com/styles/v1/${STYLE}/tiles/{z}/{x}/{y}{r}?access_token=${token}`,
            options: { tileSize: 512, zoomOffset: -1, maxZoom: 20, attribution: ATTRIBUTION },
        },
        logo: { src: '/maps/mapbox-logo.svg', alt: 'Mapbox', href: 'https://www.mapbox.com/' },
        search: (query, area) => searchMapbox(token, query, area),
    };
}

/** The parts of a Search Box API feature we use: https://docs.mapbox.com/api/search/search-box/ */
type MapboxFeature = {
    properties: {
        name: string,
        full_address?: string,
        place_formatted?: string,
        coordinates: { latitude: number, longitude: number },
        context: {
            address?: { address_number?: string },
            street?: { name: string },
            postcode?: { name: string },
            place?: { name: string },
            country?: { name: string },
        },
        metadata?: { website?: string, phone?: string },
    },
};

async function searchMapbox(token: string, query: string, area: SearchArea): Promise<Place[]> {
    const url = new URL('https://api.mapbox.com/search/searchbox/v1/forward');
    url.search = new URLSearchParams({
        q: query,
        proximity: `${area.center.lng},${area.center.lat}`,
        limit: String(SEARCH_LIMIT),
        access_token: token,
    }).toString();
    const { features } = await fetchJson<{ features: MapboxFeature[] }>(url);
    return features.map(toPlace);
}

function toPlace({ properties: p }: MapboxFeature): Place {
    return {
        location: newLocation({
            latitude: p.coordinates.latitude,
            longitude: p.coordinates.longitude,
            poiName: p.name,
            formattedAddress: p.full_address ?? p.place_formatted ?? p.name,
            street: p.context.street?.name,
            streetNumber: p.context.address?.address_number,
            city: p.context.place?.name,
            postalCode: p.context.postcode?.name,
            country: p.context.country?.name,
        }),
        links: placeLinks({ website: p.metadata?.website, phone: p.metadata?.phone }),
    };
}
