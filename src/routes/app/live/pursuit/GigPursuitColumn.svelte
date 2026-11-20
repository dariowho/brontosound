<script lang="ts">
    import type { LiveGig } from '$lib/dbEntities/live';
    import GigPursuitCard from './GigPursuitCard.svelte';
    import { droppedGigId, isGigDrag } from './gigDrag';

    /** `needsUs`: the gigs here wait on the band, so a dot flags a non-empty column. Without `onDropGig`, gigs can't be moved. */
    let { title, gigs, needsUs = false, onDropGig }: {
        title: string,
        gigs: LiveGig[],
        needsUs?: boolean,
        onDropGig?: (gigId: number) => void,
    } = $props();

    let dropTarget = $state(false);

    function onDragOver(event: DragEvent) {
        if (!onDropGig || !isGigDrag(event)) return;
        event.preventDefault();  // accept the drop
        dropTarget = true;
    }

    function onDragLeave(event: DragEvent & { currentTarget: HTMLElement }) {
        // Moving onto a card inside the lane fires dragleave on the lane: ignore it
        if (!event.currentTarget.contains(event.relatedTarget as Node)) dropTarget = false;
    }

    function onDrop(event: DragEvent) {
        event.preventDefault();
        dropTarget = false;
        const gigId = droppedGigId(event);
        if (gigId) onDropGig?.(gigId);
    }
</script>

<section
    aria-label={title}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
    class="flex min-w-0 flex-col gap-2 rounded-lg p-3
        {dropTarget ? 'bg-primary-50 outline-dashed outline-2 outline-primary-300' : 'bg-gray-100'}"
>
    <div class="flex items-start gap-2 px-1 pb-1.5 pt-0.5">
        <h2 class="flex-1 text-sm font-bold text-gray-900">{title}</h2>
        {#if needsUs && gigs.length > 0}
            <span aria-hidden="true" class="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary-700"></span>
        {/if}
        <span class="text-[13px] font-medium text-gray-600">{gigs.length}</span>
    </div>

    {#each gigs as gig (gig.id)}
        <GigPursuitCard {gig} movable={!!onDropGig} />
    {:else}
        <p class="px-1 pb-2 pt-1 text-[13px] text-gray-600">No gigs</p>
    {/each}
</section>

