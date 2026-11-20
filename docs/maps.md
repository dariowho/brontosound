# Maps

Venue pages show a map, and search it to set the venue's location. Choose the provider with `mapsProvider` in `data/bandSettings.json`, then restart the app. Settings › Maps shows the current values.

| `mapsProvider` | Map | Place search | Settings | Account |
| --- | --- | --- | --- | --- |
| `openstreetmap` (default) | any XYZ tile server | any [Nominatim](https://nominatim.org) server | `osmTileServer`, `osmNominatimServer` | none |
| `mapbox` | Static Tiles API | Search Box API | `mapboxToken` | [mapbox.com](https://account.mapbox.com) |
| `here` | Raster Tile API v3 | Geocoding and Search API v7 | `hereApiKey` | [platform.here.com](https://platform.here.com) |
| `google` | Maps JavaScript API | Places API (legacy) | `googlemapsToken` | Google Cloud |

Mapbox, HERE and OpenStreetMap are drawn with [Leaflet](https://leafletjs.com) (open source). Google uses its own SDK.

Saving a place also saves its links as venue badges: website, phone and email when the provider has them, and the place's page on the provider: Google Maps, HERE WeGo (`wego.here.com/p/<place id>`) or the OpenStreetMap object (`openstreetmap.org/<node|way|relation>/<id>`). Mapbox has no public place pages, so it saves no page link. Saving a new location replaces these links.

Keys reach the browser, so use browser keys restricted to your app's URL. Only the selected provider's key is sent.

## OpenStreetMap

Fully open source: tile servers and Nominatim can be self-hosted.

- `osmTileServer` defaults to `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Its [tile policy](https://operations.osmfoundation.org/policies/tiles/) allows light use with attribution. Any OSM raster server works (self-hosted, or a provider such as Stadia Maps or MapTiler with a key in the URL).
- `osmNominatimServer` has no default, so search is off until you set it. The public `https://nominatim.openstreetmap.org/` [allows](https://operations.osmfoundation.org/policies/nominatim/) at most 1 request per second across all users and no search-as-you-type. Brontosound only searches when you press Search. Read the policy before you use it, or self-host Nominatim.

## Code

- `src/lib/maps/tileProviders/`: one file per Leaflet provider (tiles and search).
- `src/lib/maps/place.ts`: `Place`, what every provider's search returns.
- `src/lib/components/maps/VenueMap.svelte`: picks the component for the selected provider.

To add a provider: add it to `MAPS_PROVIDERS` (`src/lib/maps/providers.ts`), write its tile provider, and add its case in `tileProvider()`.

## Not implemented

- **Vector maps** (OpenFreeMap, Protomaps, VersaTiles; all open source): these need MapLibre GL instead of Leaflet.
- **Photon** (open source, search-as-you-type over OSM data): an alternative to Nominatim.
