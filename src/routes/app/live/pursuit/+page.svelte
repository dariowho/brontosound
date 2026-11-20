<script lang="ts">
    import { LIVE_GIG_STATUS_NAME_FROM_ENUM, LiveGig, LiveGigStatus } from '$lib/dbEntities/live';
    import { saveEntityViaApi } from '$lib/db';
    import { can } from '$lib/permissions';
    import GigPursuitColumn from './GigPursuitColumn.svelte';

    let { data } = $props();
    const canMove = can(data.brontoSession, 'live.write');

    /** Board columns in pipeline order; each shows the gigs in any of its statuses, and dropping a gig sets `status`. */
    const COLUMNS: { status: LiveGigStatus, alsoShows?: LiveGigStatus[], needsUs?: boolean }[] = [
        { status: LiveGigStatus.NEW },
        { status: LiveGigStatus.WAITING_VENUE },
        { status: LiveGigStatus.WAITING_BAND, needsUs: true },
        { status: LiveGigStatus.CONFIRMED, alsoShows: [LiveGigStatus.WAITING_PAYMENT] },
    ];
    type Column = typeof COLUMNS[number];

    let gigs = $state(data.pursuitGigs as LiveGig[]);
    let moveError = $state('');

    const columnStatuses = (column: Column) => [column.status, ...(column.alsoShows ?? [])];
    const gigsIn = (column: Column) => gigs.filter((gig) => columnStatuses(column).includes(gig.status));

    /** Moves the gig on the board at once, then saves; puts it back if saving fails. */
    async function moveGig(gigId: number, column: Column) {
        const gig = gigs.find((g) => g.id === gigId);
        if (!gig || columnStatuses(column).includes(gig.status)) return;

        const previousStatus = gig.status;
        gig.status = column.status;
        moveError = '';
        try {
            await saveEntityViaApi(LiveGig, { id: gigId, status: column.status }, '/api/live/gig');
        } catch (error) {
            gig.status = previousStatus;
            moveError = `Couldn't move ${gig.venue.name}, ${gig.name}: ${(error as Error).message}`;
        }
    }
</script>

{#if moveError}
    <p role="alert" class="mb-4 text-sm text-red-700">{moveError}</p>
{/if}

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each COLUMNS as column}
        <GigPursuitColumn
            title={LIVE_GIG_STATUS_NAME_FROM_ENUM[column.status]}
            gigs={gigsIn(column)}
            needsUs={column.needsUs}
            onDropGig={canMove ? (gigId) => moveGig(gigId, column) : undefined}
        />
    {/each}
</div>
