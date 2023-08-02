<script lang="ts">
    import { Button, Heading } from "flowbite-svelte";
    import LoadingIframe from "./LoadingIframe.svelte";
    import { page } from "$app/stores";
    import PlaceholderBox from "../../PlaceholderBox.svelte";
    import RenderedChords from "./RenderedChords.svelte";
    import Fa from "svelte-fa/src/fa.svelte";
    import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
    export let data;
</script>

<section>
    {#if data.ytUrl}
        <!-- TODO: Make invidious instance confgurable -->
        <div class="flex flex-wrap items-center gap-2 sectionButtons">
            <Button class="!p-2" href="{$page.url.href}/readme/edit"><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        <LoadingIframe width='100%' height='200px' src='https://yt.artemislena.eu/embed/{data.ytUrl.id}?listen=1&autoplay=0&thin_mode=true&player_style=youtube' />    
    {:else}
        <PlaceholderBox>
            <Button href="{$page.url.href}/readme/edit">Add YouTube link</Button>
            <p style="color: gray; font-size: 0.8em; font-style: italic; margin-top: 1em;">YouTube links are extracted from the song's README.md</p>
        </PlaceholderBox>
    {/if}
</section>

<section>
    {#if data.chords}
        <div class="flex flex-wrap items-center gap-2 sectionButtons">
            <Button class="!p-2" href="{$page.url.href}/sheet/edit"><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        <div class="chords">
            <RenderedChords rawChords={data.chords} />
        </div>
    {:else}
    <PlaceholderBox>
        <Button>Add Lyrics/Chords</Button>
    </PlaceholderBox>
    {/if}
</section>

<section>
    <PlaceholderBox>
        <p>(raw file list)</p>
    </PlaceholderBox>
</section>

<style>
    section {
        margin-bottom: 1em;
    }

    .sectionButtons {
        margin-bottom: 0.5em;
        flex-direction: row-reverse;
    }

    .chords {
        border: 1px solid lightgray;
        padding: 1em;
        background: #f8f8f8;
    }

</style>