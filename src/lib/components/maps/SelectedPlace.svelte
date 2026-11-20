<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import type { Place } from '$lib/maps/place';

    /** A place chosen on the map, waiting to be saved as the venue's location. */
    let { place, onSave, onCancel }: {
        place: Place,
        onSave: () => Promise<unknown>,
        onCancel: () => void,
    } = $props();

    let saving = $state(false);

    async function save() {
        saving = true;
        try {
            await onSave();
        } finally {
            saving = false;
        }
    }
</script>

<div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
    <div>
        <p class="text-sm font-medium text-gray-900">{place.location.poiName ?? place.location.formattedAddress}</p>
        {#if place.location.poiName}
            <p class="text-xs text-gray-500">{place.location.formattedAddress}</p>
        {/if}
    </div>
    <div class="flex gap-2">
        <Button size="sm" color="alternative" onclick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={saving} onclick={save}>Save location</Button>
    </div>
</div>
