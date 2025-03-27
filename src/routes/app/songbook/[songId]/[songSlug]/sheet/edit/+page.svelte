<script lang="ts">
    import { A, Breadcrumb, Button, P, Span, Toast } from "flowbite-svelte";
    import type { ActionData } from "./$types.js";
    import { goto } from "$app/navigation";
    import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
    import { Fa } from "svelte-fa";
    import { browser } from "$app/environment";
    import { SongFilenames, StoredSong } from "$lib/songbook.js";
    import { plainToInstance } from "class-transformer";

    export let data;
    export let form: ActionData;

    let song: StoredSong = plainToInstance(StoredSong, data.song);
    let content: string = data.chordsFile.content;

    if (! content && !form ) {
        content = `What [Em]child is [G]this, who, [D]laid to rest\nOn [Em]Mary's [Am]lap, is [B]sleeping?`;
    }

    if (browser) {
        if (form?.success) goto(data.breadcrumb[data.breadcrumb.length-2].href)
    }
</script>

<form action="?/save" method="post">
    <P style="margin-bottom:1em"><Span class="uppercase">Tip:</Span> Use <A href="https://ultimate.ftes.de/" target="_blank">https://ultimate.ftes.de/</A> to convert from Ultimate Guitar format.</P>
    <textarea name="editor" id="editor" rows="20" bind:value={content}></textarea>
    <input type="hidden" name="path" value={song.buildPath(SongFilenames.CHORDS)}>

    <Button href="{data.breadcrumb[data.breadcrumb.length-2].href}" color="alternative"><Fa icon={faArrowLeft} size="sm" /> &nbsp; Back</Button>
    <Button type="submit">Save</Button>
</form>

<div class="messages">

{#if form?.success}
    <Toast color="green" contentClass="w-full text-sm font-normal flex items-center justify-between" style="display:inline-flex">
        <svelte:fragment slot="icon">
            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Check icon</span>
        </svelte:fragment>
        Saved!
    </Toast>
{/if}

</div>


<style>
    textarea {
        width: 100%;
        min-height: calc(100vh - 400px);
        margin-bottom: 1em;
    }

    .messages {
        text-align: center;
        padding: 1em;
    }
</style>