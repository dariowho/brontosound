<script lang="ts">
    import { Button, Heading } from "flowbite-svelte";
    import LoadingIframe from "./LoadingIframe.svelte";
    import { page } from "$app/stores";
    import PlaceholderBox from "../../PlaceholderBox.svelte";
    import RenderedChords from "./RenderedChords.svelte";
    export let data;
</script>

<section>
    {#if data.ytUrl}
        <!-- TODO: Make invidious instance confgurable -->
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
        <RenderedChords rawChords={data.chords} />
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

</style>