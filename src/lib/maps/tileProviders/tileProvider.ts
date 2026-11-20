import type { TileLayerOptions } from 'leaflet';
import type { MapsConfig } from '$lib/maps/providers';
import type { PlaceSearch } from '$lib/maps/place';
import { mapbox } from './mapbox';
import { here } from './here';
import { openStreetMap } from './openStreetMap';

/** A maps provider shown with Leaflet: where its map tiles come from, and how to search its places. */
export interface TileProvider {
    tiles: { url: string, options: TileLayerOptions };
    /** A logo the provider requires on its maps. */
    logo?: { src: string, alt: string, href: string };
    /** Null when the provider has no place search configured. */
    search: PlaceSearch | null;
}

export function tileProvider(config: MapsConfig): TileProvider {
    switch (config.provider) {
        case 'mapbox': return mapbox(config.key!);
        case 'here': return here(config.key!);
        case 'openstreetmap': return openStreetMap(config.tileServer!, config.nominatimServer);
        case 'google': throw new Error('Google Maps has its own map component, not tiles');
    }
}
