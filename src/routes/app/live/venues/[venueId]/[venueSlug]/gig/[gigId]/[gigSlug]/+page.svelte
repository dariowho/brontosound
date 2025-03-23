<script lang="ts">
  import PlaceholderBox from '$lib/components/PlaceholderBox.svelte';
  import { InteractionSender, LiveGig, LiveGigInteraction, LiveGigStatus, LiveVenue } from '$lib/dbEntities/live';
  import { Badge, Button, Card, Datepicker, Spinner, Textarea, Toast, Toggle, Toolbar } from 'flowbite-svelte';
  import type { ActionData } from "./$types.js";
  import { instanceToPlain, plainToInstance } from 'class-transformer';
  import GigInteractionCard from './GigInteractionCard.svelte';
    import ToastMessages from '$lib/components/ToastMessages.svelte';

  export let form: ActionData;

  export let data;
  export let gig = data.gig as LiveGig;
  // console.log('Gig', gig);

  let busy = false;

  let newInteractionFromToggle = false;
  let newInteraction: LiveGigInteraction = new LiveGigInteraction();
  newInteraction.gig = gig;
  newInteraction.note = "";
  newInteraction.date = new Date();
  $: if (newInteractionFromToggle) { newInteraction.from = InteractionSender.VENUE } else { newInteraction.from = InteractionSender.BAND };

</script>
  
<div class="busyContainer">
  {#if busy}
    <Spinner class="mt-2" />
  {:else}
    <p class="mt-2">&nbsp;</p>
  {/if}
</div>

<div class="gigData mb-10 w-full">
  <!-- <Heading tag="h2" class="mb-3">Gig</Heading> -->

<Card padding="xl" class="text-black w-full">
  <!-- <h5 class="mb-4 text-xl font-medium">Info</h5> -->
  <!-- List -->
  <ul class="my-7 space-y-4">
    <li class="flex space-x-2 rtl:space-x-reverse">
      <span class="text-base font-normal leading-tight"><strong>Name</strong>: {gig.name}</span>
    </li>
    <li class="flex space-x-2 rtl:space-x-reverse">
      <span class="text-base font-normal leading-tight"><strong>Status</strong>: {gig.status}</span>
    </li>
    <li class="flex space-x-2 rtl:space-x-reverse">
      <span class="text-base font-normal leading-tight"><strong>Note</strong>: {gig.note}</span>
    </li>
  </ul>
  <!-- <Button class="w-full">Choose plan</Button> -->
</Card>
</div>
<div class="gigInteractions">
  <!-- <Heading tag="h2" class="mb-3">Interactions</Heading> -->

  <form action="?/saveNewInteraction" method="POST">
    <Textarea class="mb-8" placeholder="Post an update" bind:value={newInteraction.note}>
      <div slot="footer" class="flex items-center justify-between">
        <Toolbar embedded>
          <Toggle bind:checked={newInteractionFromToggle}>
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
    {#each gig.interactions.sort((a, b) => {return b.date.getTime() - a.date.getTime()}) as interaction}
      <GigInteractionCard interaction={interaction}></GigInteractionCard>      
    {/each}
  </div>

  <!-- <p class="ms-auto text-xs text-gray-500 dark:text-gray-400">
    Remember, contributions to this topic should follow our <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline"> Community Guidelines </a>
    .
  </p> -->
</div>

<ToastMessages form={form} />

<style>
.interactionCards {
    width: 100%;
    text-align: center;
}
</style>
