<script lang="ts">
  import PlaceholderBox from '$lib/components/PlaceholderBox.svelte';
  import { LIVE_GIG_STATUS_NAME_FROM_ENUM, LIVE_GIG_STATUS_NAMES, LiveGig, LiveGigStatus, LiveVenue, LiveVenueLink, LiveVenueLinkSource, LiveVenueLocation } from '$lib/dbEntities/live';
  import { Badge, Button, Heading, Input, Label, Select, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Textarea, Toast } from 'flowbite-svelte';
  import type { ActionData } from "./$types.js";
    import { instanceToPlain } from 'class-transformer';
    import slugify from 'slugify';
    import ToastMessages from '$lib/components/ToastMessages.svelte';
    import type { DeepPartial } from 'typeorm';
    import { saveEntityViaApi } from '$lib/db.js';
    import { LocationLinkType } from '$lib/dbEntities/location';
    import VenueMap from '$lib/components/maps/VenueMap.svelte';
    import { locationLatLng, PLACE_PAGE_LABELS, type Place, type PlaceLink } from '$lib/maps/place';
    import { buildGigUrl } from '$lib/misc.js';
    import EditableTextBox from '$lib/components/EditableTextBox.svelte';
    import { EnvelopeOutline, GlobeOutline, LinkOutline, MapPinOutline, PhoneOutline, ProfileCardOutline } from 'flowbite-svelte-icons';
  
  export let form: ActionData;
  export let data;
  export let venue = data.venue as LiveVenue;
  // console.log('Venue', venue);
  
  $: venueLatLng = venue.location ? locationLatLng(venue.location) : null;

  let venueLinkProperies = []
  $: venueLinkProperies = venue.links.map(link => {
    return getLinkProperties(link);
  });

  function getLinkProperties(link: LiveVenueLink) {
    let result = {};
    if (link.type === LocationLinkType.WEBSITE) {
      result = {
        id: link.id,
        icon: GlobeOutline,
        text: link.value,
        href: link.value
      };
    } else if (link.type === LocationLinkType.PHONE_NUMBER) {
      result = {
        id: link.id,
        icon: PhoneOutline,
        text: link.value,
        href: `tel:${link.value}`,
      };
    } else if (link.type === LocationLinkType.EMAIL) {
      result = {
        id: link.id,
        icon: EnvelopeOutline,
        text: link.value,
        href: `mailto:${link.value}`,
      };
    } else if (link.type === LocationLinkType.INSTAGRAM) {
      result = {
        id: link.id,
        icon: ProfileCardOutline,
        href: `https://instagram.com/${link.value}`,
        text: `@${link.value}`,
      };
    } else if (link.type === LocationLinkType.FACEBOOK) {
      result = {
        id: link.id,
        icon: ProfileCardOutline,
        href: `https://facebook.com/${link.value}`,
        text: `@${link.value}`,
      };
    } else if (PLACE_PAGE_LABELS[link.type]) {
      result = {
        id: link.id,
        icon: MapPinOutline,
        href: link.value,
        text: PLACE_PAGE_LABELS[link.type],
      };
    } else {
      result = {
        id: link.id,
        icon: LinkOutline,
        href: null,
        text: link.value,
      };
    }
    return result;
  }

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

  const MAP_LINK_SOURCES = [LiveVenueLinkSource.MAPS_PROVIDER, LiveVenueLinkSource.GOOGLE_MAPS];

  function mergeLocationLinks(locationLinks: PlaceLink[]) : Partial<LiveVenueLink>[] {
    if (! venue.links) {
      venue.links = [];
    }
    let newLinks: Partial<LiveVenueLink>[] = structuredClone(venue.links).filter(link => !MAP_LINK_SOURCES.includes(link.source));
    for (let i = 0; i < locationLinks.length; i++) {
      let newLink = {
        type: locationLinks[i].type,
        value: locationLinks[i].value,
        source: LiveVenueLinkSource.MAPS_PROVIDER,
        venue: venue
      };
      
      if (!newLinks.some(link => {link.value === newLink.value || link.type === newLink.type})) {
        newLinks.push(newLink);
      }
    }
    console.log('Merged links:', newLinks);
    return newLinks;
  }

  async function updateVenueLocation(place: Place) {
    const newLocation = place.location;
    if (venue.location) {
      newLocation.id = venue.location.id;
    }
    return updateVenue({
      location: newLocation,
      links: mergeLocationLinks(place.links),
    });
  }

  async function handleSaveNote(value: string) {
    return updateVenue({note: value})
  }

  let busy = false;
  let newGig: LiveGig = null;

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

<div class="grid md:grid-cols-2 gap-2 mb-5" style="min-height:300px;">
  <div class="map mb-5" style="width:100%; height: 100%; min-height:300px;">
    <VenueMap config={data.safeBandSettings.maps} location={venueLatLng} onSave={updateVenueLocation} />
  </div>
  <div class="venueNote" style="min-height:200px;">
    <EditableTextBox bind:content={venue.note} bind:editingDisabled={busy} handleSave={handleSaveNote} height="100%"/>
  </div>
</div>

<div class="venueLinks mb-5">
  {#each venueLinkProperies as link}
  <Badge
    dismissable on:close={() => updateVenue({links: venue.links.filter(l => l.id !== link.id)})}
    href={link.href}
    class="mb-2 mr-2 h-8" border
  >
    <link.icon style="display:inline"/>
    {link.text}
  </Badge>
  {/each}
</div>

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
          <TableBodyCell><a href={buildGigUrl(gig, venue)}>{gig.name}</a></TableBodyCell>
          <TableBodyCell>{LIVE_GIG_STATUS_NAME_FROM_ENUM[gig.status]}</TableBodyCell>
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
