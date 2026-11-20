<script lang="ts">
    import type { LiveGig } from '$lib/dbEntities/live';
    import GigPursuitCard from './GigPursuitCard.svelte';

    /** `needsUs`: the gigs here wait on the band, so a dot flags a non-empty column. */
    let { title, gigs, needsUs = false }: { title: string, gigs: LiveGig[], needsUs?: boolean } = $props();
</script>

<section aria-label={title} class="flex min-w-0 flex-col gap-2 rounded-lg bg-gray-100 p-3">
    <div class="flex items-start gap-2 px-1 pb-1.5 pt-0.5">
        <h2 class="flex-1 text-sm font-bold text-gray-900">{title}</h2>
        {#if needsUs && gigs.length > 0}
            <span aria-hidden="true" class="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary-700"></span>
        {/if}
        <span class="text-[13px] font-medium text-gray-600">{gigs.length}</span>
    </div>

    {#each gigs as gig (gig.id)}
        <GigPursuitCard {gig} />
    {:else}
        <p class="px-1 pb-2 pt-1 text-[13px] text-gray-600">No gigs</p>
    {/each}
</section>
