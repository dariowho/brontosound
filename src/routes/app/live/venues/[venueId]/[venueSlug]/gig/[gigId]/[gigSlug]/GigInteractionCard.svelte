<script lang="ts">
    import { InteractionSender, type LiveGigInteraction } from "$lib/dbEntities/live";
    import { Card, Dropdown, DropdownItem } from "flowbite-svelte";
    import { DotsHorizontalOutline, StoreOutline, UserOutline } from "flowbite-svelte-icons";

    export let interaction: LiveGigInteraction;
</script>

<div class="interactionCard bandInteraction w-full pb-5">
    <Card padding="md" size="xl" class="{(interaction.from == InteractionSender.VENUE) ? 'bg-gray-100' : ''}">
      <div class="flex justify-end">
        <DotsHorizontalOutline />
        <Dropdown class="w-36">
          <DropdownItem disabled>Edit</DropdownItem>
          <DropdownItem disabled>Delete</DropdownItem>
        </Dropdown>
      </div>
      <div class="flex flex-row items-center pb-4">
        
            {#if interaction.from == InteractionSender.BAND}
                <span class="avatar text-gray-700 mr-5 rounded-sm">
                    <UserOutline class="w-16 h-16 pb-0" />
                </span>
            {:else}
                <span class="avatar bg-gray-100 text-gray-700 mr-5 rounded-sm">
                    <StoreOutline class="w-16 h-16 pb-0 bg-white" />
                </span>
            {/if}
        <span class="message">
          <span class="date">{interaction.date}</span>
          {interaction.note}
        </span>
      </div>
    </Card>
  </div>

<style>
.date {
  display: block;
  font-size: .8em;
  color: dimgray;
}

.message {
  color: black;
  text-align: left;
}

.avatar {
  border: 1px solid #a3a1a1;
}
</style>