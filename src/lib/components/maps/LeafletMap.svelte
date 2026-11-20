<script lang="ts">
    import 'leaflet/dist/leaflet.css';
    import type * as Leaflet from 'leaflet';
    import { onDestroy, onMount } from 'svelte';
    import { CITY_ZOOM, DEFAULT_CENTER, locationLatLng, PLACE_ZOOM, type LatLng, type Place, type SearchArea } from '$lib/maps/place';
    import type { TileProvider } from '$lib/maps/tileProviders/tileProvider';
    import PlaceSearch from './PlaceSearch.svelte';
    import SelectedPlace from './SelectedPlace.svelte';

    /** A Leaflet map of a provider's tiles: pins the saved location, finds and saves a new one. */
    let { provider, location, onSave }: {
        provider: TileProvider,
        location: LatLng | null,
        onSave: (place: Place) => Promise<unknown>,
    } = $props();

    const PIN_STYLE: Leaflet.CircleMarkerOptions = { radius: 9, weight: 3, color: '#FFFFFF', fillColor: '#EB4F27', fillOpacity: 1 };

    let mapElement: HTMLDivElement;
    let map: Leaflet.Map | undefined;
    let pin: Leaflet.CircleMarker | undefined;
    let selected: Place | null = $state(null);

    onMount(async () => {
        const L = await import('leaflet'); // Leaflet needs `window`: load it in the browser only
        map = L.map(mapElement).setView(location ?? DEFAULT_CENTER, location ? PLACE_ZOOM : CITY_ZOOM);
        L.tileLayer(provider.tiles.url, provider.tiles.options).addTo(map);
        pin = L.circleMarker(DEFAULT_CENTER, PIN_STYLE);
        showPin(location);
    });

    onDestroy(() => map?.remove());

    /** Pin a position and center the map on it; null removes the pin. */
    function showPin(position: LatLng | null) {
        if (!map || !pin) return;
        if (!position) {
            pin.remove();
            return;
        }
        pin.setLatLng(position).addTo(map);
        map.setView(position, PLACE_ZOOM);
    }

    function visibleArea(): SearchArea {
        const bounds = map!.getBounds();
        return { center: map!.getCenter(), west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() };
    }

    function select(place: Place) {
        selected = place;
        showPin(locationLatLng(place.location));
    }

    function cancel() {
        selected = null;
        showPin(location);
    }

    async function save() {
        await onSave(selected!);
        selected = null;
    }
</script>

<div class="flex h-full flex-col gap-2">
    {#if provider.search}
        <PlaceSearch search={provider.search} area={visibleArea} onSelect={select} />
    {:else}
        <p class="text-sm text-gray-500">Place search is not set up for this maps provider. See Settings › Maps.</p>
    {/if}

    <!-- isolate: keeps Leaflet's high z-indexes inside the map -->
    <div class="relative isolate min-h-[300px] flex-1 overflow-hidden rounded-lg border border-gray-200">
        <div class="absolute inset-0" bind:this={mapElement}></div>
        {#if provider.logo}
            <a href={provider.logo.href} target="_blank" rel="noopener" class="absolute bottom-1 left-1 z-[1000]">
                <img src={provider.logo.src} alt={provider.logo.alt} width="88" height="23" />
            </a>
        {/if}
    </div>

    {#if selected}
        <SelectedPlace place={selected} onSave={save} onCancel={cancel} />
    {/if}
</div>
