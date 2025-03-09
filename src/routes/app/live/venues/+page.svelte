<script lang="ts">
    import { saveEntityViaApi } from '$lib/db';
    import { LiveVenue } from '$lib/dbEntities/live';
    import { Button, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Input, Spinner } from 'flowbite-svelte';
    import { CirclePlusOutline } from 'flowbite-svelte-icons';
    import slugify from 'slugify';

    export let data;
    export let venues = data.venues as LiveVenue[];
    // console.log('Venues', venues);

    let busy = false;
    let newVenueName = '';

    function buildVenueURL(venue) {
      const slug = slugify(venue.name, { lower: true });
      return `/app/live/venues/${venue.id}/${slug}`;
    }

    async function addNewVenue() {
      busy = true;
      console.log('Adding venue', newVenueName);
      let newVenue: LiveVenue = {
        name: newVenueName,
      };
      let venue: LiveVenue = await saveEntityViaApi(LiveVenue, newVenue, '/api/live/venue');
      console.log('Added venue', venue);
      venues.push(venue);
      venues = venues;
      newVenueName = '';
      busy = false;
    }
  </script>
  
<div class="busyContainer">
  {#if busy}
    <Spinner class="mt-2" />
  {:else}
    <p class="mt-2">&nbsp;</p>
  {/if}
</div>



<Table hoverable={true}>
  <TableHead>
    <!-- <TableHeadCell class="!p-4">
      <Checkbox />
    </TableHeadCell> -->
    <TableHeadCell>Venue Name</TableHeadCell>
    <TableHeadCell>Added</TableHeadCell>
    <!-- <TableHeadCell>
      <span class="sr-only"> Edit </span>
    </TableHeadCell> -->
  </TableHead>
  <TableBody>

    {#each venues as venue}
      <TableBodyRow>
        <!-- <TableBodyCell class="!p-4">
          <Checkbox />
        </TableBodyCell> -->
        <TableBodyCell>
          <a href="{buildVenueURL(venue)}">
            {venue.name}
          </a>
        </TableBodyCell>
        <TableBodyCell>{new Date(venue.creationDate).toLocaleDateString('it-IT')}</TableBodyCell>
        <!-- <TableBodyCell>
          <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
            Edit
          </a>
        </TableBodyCell> -->
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>

<div>
  <form on:submit={addNewVenue} class="newVenueForm">
    <Input class="mt-2" placeholder="The Cave Liverpool" bind:value={newVenueName} />
    <span class="newVenueButton" title="Add new venue"><Button class="mt-2" color="primary" disabled={newVenueName.length == 0} on:click={addNewVenue}><CirclePlusOutline /></Button></span>
  </form>
</div>

<style>
  .busyContainer {
    text-align: right;
    margin-bottom: .5em;
  }

  .newVenueForm {
    display: flex;
    flex-direction: row;
    max-width: 800px;
    margin-top: 1em;
  }

  .newVenueButton {
    margin-left: 1em;
  }
</style>
