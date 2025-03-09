<script lang="ts">
    import { LiveVenue } from '$lib/dbEntities/live';
    import { Heading, Spinner } from 'flowbite-svelte';

    export let data;
    export let venue = data.venue as LiveVenue;
    console.log('Venue', venue);

    let busy = false;
  </script>
  
<div class="busyContainer">
  {#if busy}
    <Spinner class="mt-2" />
  {:else}
    <p class="mt-2">&nbsp;</p>
  {/if}
</div>

<Heading tag="h2">Proposed gigs</Heading>
<Heading tag="h2">Past gigs</Heading>
<style>

</style>
