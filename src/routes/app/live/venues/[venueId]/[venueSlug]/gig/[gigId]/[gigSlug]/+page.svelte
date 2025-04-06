<script lang="ts">
  import PlaceholderBox from '$lib/components/PlaceholderBox.svelte';
  import { InteractionSender, LIVE_GIG_STATUS_NAMES, LiveGig, LiveGigInteraction, LiveGigStatus, LiveVenue } from '$lib/dbEntities/live';
  import { A, Badge, Button, Card, Datepicker, Heading, Input, Label, Select, Spinner, Textarea, Toast, Toggle, Toolbar } from 'flowbite-svelte';
  import type { ActionData } from "./$types.js";
  import { instanceToPlain, plainToInstance } from 'class-transformer';
  import GigInteractionCard from './GigInteractionCard.svelte';
  import ToastMessages from '$lib/components/ToastMessages.svelte';
  import Markdown from '@magidoc/plugin-svelte-marked';
    import { page } from '$app/state';
    import Fa from 'svelte-fa';
    import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
    import type { DeepPartial } from 'typeorm';
    import { saveEntityViaApi } from '$lib/db.js';
    import { CurrencyCode } from '$lib/currencyCodes.js';

  export let form: ActionData;

  export let data;
  export let gig = data.gig as LiveGig;
  // console.log('Gig', gig);

  let busy = false;
  let editingNotes = false;

  let newInteractionFromToggle = false;
  let newInteraction: LiveGigInteraction = new LiveGigInteraction();
  newInteraction.gig = gig;
  newInteraction.note = "";
  newInteraction.date = new Date();
  $: if (newInteractionFromToggle) { newInteraction.from = InteractionSender.VENUE } else { newInteraction.from = InteractionSender.BAND };

  async function updateGig(newProperties:DeepPartial<LiveGig>) {
    busy = true;
    let updatedGig: DeepPartial<LiveVenue> = {
      id: gig.id,
      ...newProperties
    };
    console.log('Updating gig:', updatedGig);

    let newGig: LiveGig = await saveEntityViaApi(LiveGig, updatedGig, '/api/live/gig');
    console.log('Updated gig:', newGig);
    gig = newGig;

    busy = false;
  }

  function handleEscape(event) {
		if (event.key === 'Escape') {
      console.log(event);
      if (event.target.id == "proposedCachet") {
        event.target.value = (gig.proposedCachet) ? gig.proposedCachet.amount : null;
        event.target.blur();
      } else if (event.target.id == "gigNoteTextarea") {
        editingNotes = false;
      } else {
        console.error("Invalid id for escape handler:", event.target.id)
      }
		}
  }
</script>
  
<div class="busyContainer" style="text-align: right;">
  {#if busy}
    <Spinner style="height: 1rem;"/>
  {:else}
    <p style="display: block; height:1.5rem;">&nbsp;</p>
  {/if}
</div>

<div class="gigData mb-10">
  <div class="gigData grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <Label for="first_name" class="mb-2">Status</Label>
      <Select items={LIVE_GIG_STATUS_NAMES} value={gig.status} disabled={busy} on:change={async (e) => {
        const value =  (e.target as HTMLSelectElement).value;
        await updateGig({status: LiveGigStatus[value]});
      }}/>
    </div>
    <div>
      <Label for="first_name" class="mb-2">We aksed (EUR)</Label>
      <Input type="number" step="0.01" id="proposedCachet" placeholder="500" value={(gig.proposedCachet) ? gig.proposedCachet.amount : null} on:keydown={handleEscape} on:change={async (e) => {
        const value =  (e.target as HTMLInputElement).value;
        await updateGig({proposedCachet: {amount: parseFloat(value), currency: CurrencyCode.EUR}});
      }} />
    </div>
  </div>

  {#if gig.note || editingNotes}
    <div class="gigNotes">
      {#if editingNotes}
        <Textarea id="gigNoteTextarea" style="min-height:10rem" value={gig.note} disabled={busy} on:keydown={handleEscape} on:blur={async (e) => {
          const value =  (e.target as HTMLTextAreaElement).value;
          await updateGig({note: value});
          editingNotes = false;
        }}/>
      {:else}
        <div class="gigNotesMarkdown p-2 rounded-md">
          <div class="sectionButtons">
            <Button class="!p-2 mb-2" on:click={() => editingNotes = true} disabled={busy}><Fa icon={faPenToSquare} size="lg" /></Button>
          </div>
          <Markdown source={gig.note} />
        </div>
      {/if}

      <!-- <div
        class="gigNotesMarkdown p-2 rounded-md" class:editing={editingNotes} class:bg-gray-50={editingNotes}
        contenteditable={editingNotes && ! busy} on:blur={
          async (e) => {
            const target = e.target as HTMLDivElement
            const value = target.innerText;
            await updateGig({note: value});
            editingNotes = false;
          }}
        >
        <div class="sectionButtons">
          <Button class="!p-2 mb-2" on:click={() => editingNotes = true} disabled={busy}><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        {#if editingNotes}
          TEXT
          {gig.note}
        {:else}
          MARKDOWN
          <Markdown source={gig.note} />
        {/if}
      </div> -->
      
    </div>
  {:else}
    <PlaceholderBox>
      <Button disabled={busy} on:click={() => {editingNotes = true}}>Add Gig notes</Button>
    </PlaceholderBox>
  {/if}

  
  
</div>

<Heading tag="h2" class="mb-3">Interactions</Heading>
<div class="gigInteractions">
  <form action="?/saveNewInteraction" method="POST">
    <Textarea class="mb-8" placeholder="Post an update" bind:value={newInteraction.note}>
      <div slot="footer" class="flex items-center justify-between gap-3 flex-wrap">
        <Toolbar embedded class="gap-3">
          <Toggle bind:checked={newInteractionFromToggle} class="leading-9">
            <svelte:fragment slot="offLabel"><span class="{(newInteraction.from != InteractionSender.BAND) ? 'text-gray-500' : ''}">band</span></svelte:fragment>
            <span class="{(newInteraction.from != InteractionSender.VENUE) ? 'text-gray-500' : ''}">venue</span>
          </Toggle>
          <span class="mr-5"></span>
          <div style="min-width:250px">
            <Datepicker bind:value={newInteraction.date} />
          </div>
        </Toolbar>
        <input type="hidden" name="newInteractionJson" value={JSON.stringify(instanceToPlain(newInteraction))} />
        <Button type="submit" disabled={newInteraction.note.length == 0}>Post update</Button>
      </div>
    </Textarea>
  </form>

  <div class="interactionCards">
    {#each gig.interactions.sort((a, b) => {return new Date(b.date).getTime() - new Date(a.date).getTime()}) as interaction}
      <GigInteractionCard interaction={interaction} locale={data.safeBandSettings.locale}></GigInteractionCard>      
    {/each}
  </div>

  <!-- <p class="ms-auto text-xs text-gray-500 dark:text-gray-400">
    Remember, contributions to this topic should follow our <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline"> Community Guidelines </a>
    .
  </p> -->
</div>

<ToastMessages form={form} />

<style>
  .gigNotesMarkdown {
    border: 1px solid lightgray;
    min-height: 5rem;
  }

  .sectionButtons {
    float: right;
  }

  .interactionCards {
      width: 100%;
      text-align: center;
  }

  /* .editing {
    font-family: monospace;
  } */
</style>
