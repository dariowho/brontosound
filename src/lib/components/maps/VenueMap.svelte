<script lang="ts">
    import { MAPS_PROVIDERS, type MapsConfig } from '$lib/maps/providers';
    import type { LatLng, Place } from '$lib/maps/place';
    import { tileProvider } from '$lib/maps/tileProviders/tileProvider';
    import GoogleMap from './GoogleMap.svelte';
    import LeafletMap from './LeafletMap.svelte';

    /** A venue's map, drawn by the maps provider chosen in band settings. Without `onSave`, it only shows the location. */
    let { config, location, onSave }: {
        config: MapsConfig,
        location: LatLng | null,
        onSave?: (place: Place) => Promise<unknown>,
    } = $props();

    let { name, keySetting } = $derived(MAPS_PROVIDERS[config.provider]);
</script>

{#if keySetting && !config.key}
    <div class="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        <p>There is no map yet: {name} needs <code>{keySetting}</code> in bandSettings.json.</p>
    </div>
{:else if config.provider === 'google'}
    <GoogleMap token={config.key!} lat={location?.lat} lng={location?.lng} {onSave} />
{:else}
    <LeafletMap provider={tileProvider(config)} {location} {onSave} />
{/if}
