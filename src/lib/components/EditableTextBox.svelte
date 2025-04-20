<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";
    import PlaceholderBox from "./PlaceholderBox.svelte";
    import Markdown from "@magidoc/plugin-svelte-marked";
    import Fa from "svelte-fa";
    import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

    export let content: string;
    export let handleSave: CallableFunction;
    export let isEditing = false;
    export let editingDisabled = false;
    export let height: string = "10rem";

    function handleEscape(event) {
        if (event.key === 'Escape') {
            // console.log("handleEscape (EditableTextBox):", event);
            isEditing = false;
        }
    }
</script>

{#if content || isEditing}
    <div class="gigNotes" style="height: {height};">
      {#if isEditing}
        <Textarea id="gigNoteTextarea" style="height: {height}" value={content} disabled={editingDisabled} on:keydown={handleEscape} on:blur={async (e) => {
          const value =  (e.target as HTMLTextAreaElement).value;
          await handleSave(value);
          isEditing = false;
        }}/>
      {:else}
        <div class="gigNotesMarkdown p-2 rounded-md" style="min-height: {height};">
          <div class="sectionButtons">
            <Button class="!p-2 mb-2" on:click={() => isEditing = true} disabled={editingDisabled}><Fa icon={faPenToSquare} size="lg" /></Button>
          </div>
          <Markdown source={content} />
        </div>
      {/if}

      <!-- <div
        class="gigNotesMarkdown p-2 rounded-md" class:editing={isEditing} class:bg-gray-50={isEditing}
        contenteditable={isEditing && ! editingDisabled} on:blur={
          async (e) => {
            const target = e.target as HTMLDivElement
            const value = target.innerText;
            await updateGig({note: value});
            isEditing = false;
          }}
        >
        <div class="sectionButtons">
          <Button class="!p-2 mb-2" on:click={() => isEditing = true} disabled={editingDisabled}><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        {#if isEditing}
          TEXT
          {content}
        {:else}
          MARKDOWN
          <Markdown source={content} />
        {/if}
      </div> -->
      
    </div>
  {:else}
    <PlaceholderBox {height}>
      <Button disabled={editingDisabled} on:click={() => {isEditing = true}}>Add Notes</Button>
    </PlaceholderBox>
  {/if}

  <style>
    .gigNotesMarkdown {
      border: 1px solid lightgray;
      min-height: 5rem;
    }
  
    .sectionButtons {
      float: right;
    }

    /* .editing {
      font-family: monospace;
    } */
  </style>
  