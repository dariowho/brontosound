<script lang="ts">
    import type { LiveGig } from '$lib/dbEntities/live';
    import { buildGigUrl } from '$lib/misc';

    let { gig }: { gig: LiveGig } = $props();

    const interactionCount = $derived(gig.interactions?.length ?? 0);
    const lastInteractionDate = $derived(
        interactionCount ? new Date(Math.max(...gig.interactions.map((i) => new Date(i.date).getTime()))) : null
    );
</script>

<a
    href={buildGigUrl(gig, gig.venue)}
    class="flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-gray-900 hover:border-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
>
    <h3 class="text-[15px] font-bold leading-snug [overflow-wrap:anywhere]">{gig.venue.name}</h3>
    <span class="text-sm text-gray-600 [overflow-wrap:anywhere]">{gig.name}</span>
    {#if gig.note}
        <p class="mt-2 line-clamp-2 text-[13px] text-gray-500">{gig.note}</p>
    {/if}
    {#if lastInteractionDate}
        <div class="mt-3 flex justify-between gap-2 border-t border-gray-200 pt-2.5 text-xs text-gray-500">
            <span>{interactionCount} {interactionCount === 1 ? 'interaction' : 'interactions'}</span>
            <span>{lastInteractionDate.toLocaleDateString('it-IT')}</span>
        </div>
    {/if}
</a>
