<script lang="ts">
    import { LIVE_GIG_STATUS_NAME_FROM_ENUM, LiveGig, LiveGigStatus } from '$lib/dbEntities/live';
    import GigPursuitColumn from './GigPursuitColumn.svelte';

    let { data } = $props();

    /** Board columns in pipeline order; each shows the gigs in any of its statuses. */
    const COLUMNS: { status: LiveGigStatus, alsoShows?: LiveGigStatus[], needsUs?: boolean }[] = [
        { status: LiveGigStatus.NEW },
        { status: LiveGigStatus.WAITING_VENUE },
        { status: LiveGigStatus.WAITING_BAND, needsUs: true },
        { status: LiveGigStatus.CONFIRMED, alsoShows: [LiveGigStatus.WAITING_PAYMENT] },
    ];

    function gigsWithStatus(statuses: LiveGigStatus[]): LiveGig[] {
        return data.pursuitGigs.filter((gig) => statuses.includes(gig.status)) as LiveGig[];
    }
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each COLUMNS as column}
        <GigPursuitColumn
            title={LIVE_GIG_STATUS_NAME_FROM_ENUM[column.status]}
            gigs={gigsWithStatus([column.status, ...(column.alsoShows ?? [])])}
            needsUs={column.needsUs}
        />
    {/each}
</div>
