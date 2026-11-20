<script lang="ts">
    import { Button, Input } from 'flowbite-svelte';
    import type { Place, PlaceSearch, SearchArea } from '$lib/maps/place';

    /** A search box for places: searches on submit, then lists the results to choose from. */
    let { search, area, onSelect }: {
        search: PlaceSearch,
        area: () => SearchArea,
        onSelect: (place: Place) => void,
    } = $props();

    let query = $state('');
    let results: Place[] | null = $state(null);
    let searching = $state(false);
    let error: string | null = $state(null);

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        searching = true;
        error = null;
        try {
            results = await search(query.trim(), area());
        } catch (e) {
            error = (e as Error).message;
            results = null;
        } finally {
            searching = false;
        }
    }

    function choose(place: Place) {
        results = null;
        onSelect(place);
    }
</script>

<form class="relative flex gap-2" onsubmit={submit}>
    <Input bind:value={query} oninput={() => results = null} placeholder="e.g. Blue Note Milano" aria-label="Venue name or address" required />
    <Button type="submit" disabled={searching}>Search</Button>

    {#if results}
        <ul class="absolute inset-x-0 top-full z-10 mt-1 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {#each results as place}
                <li>
                    <button type="button" class="w-full px-4 py-2 text-left hover:bg-gray-50" onclick={() => choose(place)}>
                        <span class="block text-sm font-medium text-gray-900">{place.location.poiName ?? place.location.formattedAddress}</span>
                        {#if place.location.poiName}
                            <span class="block text-xs text-gray-500">{place.location.formattedAddress}</span>
                        {/if}
                    </button>
                </li>
            {:else}
                <li class="px-4 py-2 text-sm text-gray-500">No places found for "{query}". Try adding the city.</li>
            {/each}
        </ul>
    {/if}
</form>
{#if error}
    <p class="mt-1 text-sm text-red-700">Search failed: {error}</p>
{/if}
