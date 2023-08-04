<script lang="ts">
    import { Breadcrumb, Button, Toast } from "flowbite-svelte";
    import type { ActionData } from "./$types.js";
    import { goto } from "$app/navigation";
    import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa/src/fa.svelte";
    import { browser } from "$app/environment";

    export let data;
    export let form: ActionData;

    let content: string = data.readme;

    if (! content && !form ) {
        content = `This is your song's Readme, use it to write any note or comment for others to see! (tip: you can use [Markdown](https://www.markdownguide.org/cheat-sheet/) here)\n\nYouTube links such as https://www.youtube.com/watch?v=dQw4w9WgXcQ will be extracted and shown on your song page!`;
    }

    if (browser) {
        if (form?.success) goto(data.breadcrumb[data.breadcrumb.length-2].href)
    }
</script>

<form action="?/save" method="post">
    <textarea name="editor" id="editor" rows="20" bind:value={content}></textarea>

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