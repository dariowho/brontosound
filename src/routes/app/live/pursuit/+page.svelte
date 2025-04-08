<script lang="ts">
    import { LIVE_GIG_STATUS_NAME_FROM_ENUM, LIVE_GIG_STATUS_NAMES, LiveGig, LiveGigStatus } from '$lib/dbEntities/live';
    import { Card, Button, Heading } from 'flowbite-svelte';
    import { ArrowRightOutline, FireOutline, StoreOutline, TableColumnOutline } from 'flowbite-svelte-icons';
    import GigPursuitColumn from './GigPursuitColumn.svelte';

    export let data;

    function filteredGigs(statusValues: LiveGigStatus[]): LiveGig[] {
      return data.pursuitGigs.filter((gig) => statusValues.includes(gig.status)) as LiveGig[]
    }
    let newGigs = data.pursuitGigs.filter((gig) => gig.status == LiveGigStatus.NEW)
    let inProgressGigs = data.pursuitGigs.filter((gig) => gig.status == LiveGigStatus.WAITING_BAND || gig.status == LiveGigStatus.WAITING_VENUE)
  </script>
  
<div class="grid md:grid-cols-4 gap-3 overflow-x-scroll">
    <GigPursuitColumn columnName={LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.NEW]} gigs={filteredGigs([LiveGigStatus.NEW])} />
    <GigPursuitColumn columnName={LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.WAITING_VENUE]} gigs={filteredGigs([LiveGigStatus.WAITING_VENUE])} />
    <GigPursuitColumn columnName={LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.WAITING_BAND]} gigs={filteredGigs([LiveGigStatus.WAITING_BAND])} />
    <GigPursuitColumn columnName={LIVE_GIG_STATUS_NAME_FROM_ENUM[LiveGigStatus.CONFIRMED]} gigs={filteredGigs([LiveGigStatus.CONFIRMED, LiveGigStatus.WAITING_PAYMENT])} />
</div>
