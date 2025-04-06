<script lang="ts">
  import PlaceholderBox from '$lib/components/PlaceholderBox.svelte';
  import { LIVE_GIG_STATUS_NAMES, LiveGig, LiveGigStatus, LiveVenue, LiveVenueLocation } from '$lib/dbEntities/live';
  import { Button, Heading, Input, Label, Select, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Textarea, Toast } from 'flowbite-svelte';
  import type { ActionData } from "./$types.js";
    import { instanceToPlain } from 'class-transformer';
    import slugify from 'slugify';
    import ToastMessages from '$lib/components/ToastMessages.svelte';
    import type { DeepPartial } from 'typeorm';
    import { saveEntityViaApi } from '$lib/db.js';
    import type { Location } from '$lib/dbEntities/location';
    import GoogleMapAndSearch from '$lib/components/GoogleMapAndSearch.svelte';
  
  export let form: ActionData;
  export let data;
  export let venue = data.venue as LiveVenue;
  // console.log('Venue', venue);
  
  const googlemapsToken = data.safeBandSettings.googlemapsToken;
  let lng, lat;
  lat = (venue.location) ? venue.location.latitude : null;
  lng = (venue.location) ? venue.location.longitude : null;
  let addingNewLocation = false;
  // $: if (venue.location) { [lat, lng] = [venue.location.latitude, venue.location.longitude] }


  async function updateVenue(newProperties:DeepPartial<LiveVenue>) {
    busy = true;
    let updatedVenue: DeepPartial<LiveVenue> = {
      id: venue.id,
      ...newProperties
    };
    // console.log('Updating venue:', updatedVenue);

    let newVenue: LiveVenue = await saveEntityViaApi(LiveVenue, updatedVenue, '/api/live/venue');
    console.log('Updated venue:', newVenue);
    venue = newVenue;
    busy = false;
  }

  async function updateVenueLocation(newLocation: Location) {
    // let newVenueLocation = {...newLocation, venue: venue};
    if (venue.location) {
      newLocation.id = venue.location.id;
    }
    return updateVenue({
      location: newLocation
      // location: newVenueLocation
    });
  }

  let busy = false;
  let newGig: LiveGig = null;

  function getGigUrl(gig: LiveGig) {
    return `/app/live/venues/${venue.id}/${slugify(venue.name)}/gig/${gig.id}/${slugify(gig.name)}`;
  }

  function startNewGig() {
    newGig = new LiveGig();
    newGig.status = LiveGigStatus.NEW;
    newGig.venue = venue;
    newGig.name = '';
    newGig.date = new Date();
    newGig.note = '';
    console.log('New gig', newGig);
  }

  
</script>
  
<!-- <div class="busyContainer">
  {#if busy}
    <Spinner class="mt-2" />
  {:else}
    <p class="mt-2">&nbsp;</p>
  {/if}
</div> -->

{#if googlemapsToken}
  <div class="map mb-5" style="width:100%; height: 300px;">
     <GoogleMapAndSearch {googlemapsToken} {lat} {lng} handleUpdateLocation={updateVenueLocation} />
  </div>
  <!-- {#if ((lat && lng) || addingNewLocation)}
    <div class="map mb-5" style="width:100%; height: 300px;">
      <GoogleMapsMap {googlemapsToken} {lat} {lng} handleUpdateLocation={updateVenueLocation}/>
    </div>
  {:else}
    <PlaceholderBox>
        <Button on:click={()=>{addingNewLocation = true}}>Add Location</Button>
    </PlaceholderBox>
  {/if} -->

{/if}

<Heading tag="h2" class="mb-3">Gigs</Heading>

{#if venue.gigs.length == 0 && ! newGig}
  <PlaceholderBox>
    <p class="mb-3">You never performed here 😢. Add a new gig if you did so in th past, or if you want to ask {data.venue.name} for the future!</p>
    <Button on:click={startNewGig}>Add a past or future gig</Button>
  </PlaceholderBox>
{:else}
  {#if newGig}
  <form  action="?/saveNewGig" method="POST" class="mb-3">
    <div class="grid gap-6 mb-6 md:grid-cols-2">
      <div>
        <Label for="gig_name" class="mb-2">Gig name</Label>
        <Input type="text" id="gigName" placeholder="Summer season shows" bind:value={newGig.name} required />
      </div>
      <!-- <div>
        <Label for="phone" class="mb-2">Date</Label>
        <Input type="date" id="date" bind:value={newGig.date} />
      </div> -->
      <div>
        <Label for="gigStatus" class="mb-2">Status</Label>
        <Select items={LIVE_GIG_STATUS_NAMES} bind:value={newGig.status} />
        <!-- <Input type="text" id="gigStatus" placeholder="Doe" required /> -->
      </div>
    </div>
    <div class="mb-6">
      <Label for="email" class="mb-2">Note <i>(optional)</i></Label>
      <Textarea placeholder="{venue.name} is hosting a 80s themed event. We want to perform" bind:value={newGig.note} />
    </div>
    <input type="hidden" name="newGigJson" value={JSON.stringify(instanceToPlain(newGig))} />
    <Button type="submit">Add</Button>
    <Button color="light" on:click={() => newGig = null}>Cancel</Button>

  </form>
  {/if}
  {#if venue.gigs.length > 0}
    {#if ! newGig}
      <Button on:click={startNewGig} class="mt-5 mb-3">Add a past or future gig</Button>
    {/if}
    <Table hoverable={true}>
    <TableHead>
      <!-- <TableHeadCell class="!p-4">
        <Checkbox />
      </TableHeadCell> -->
      <TableHeadCell>Gig Name</TableHeadCell>
      <TableHeadCell>Status</TableHeadCell>
      <TableHeadCell>Added</TableHeadCell>
      <TableHeadCell>Note</TableHeadCell>
      <!-- <TableHeadCell>
        <span class="sr-only"> Edit </span>
      </TableHeadCell> -->
    </TableHead>
    <TableBody>
  
      {#each venue.gigs as gig}
        <TableBodyRow>
          <!-- <TableBodyCell class="!p-4">
            <Checkbox />
          </TableBodyCell> -->
          <TableBodyCell><a href={getGigUrl(gig)}>{gig.name}</a></TableBodyCell>
          <TableBodyCell>{gig.status}</TableBodyCell>
          <TableBodyCell>{new Date(gig.creationDate).toLocaleDateString('it-IT')}</TableBodyCell>
          <TableBodyCell>{gig.note}</TableBodyCell>          
          <!-- <TableBodyCell>
            <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
              Edit
            </a>
          </TableBodyCell> -->
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  {/if} 
{/if}

<!-- <Heading tag="h2" class="mb-3 mt-5">Past gigs</Heading> -->

<ToastMessages form={form} />
