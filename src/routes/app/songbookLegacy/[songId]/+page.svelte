<script lang="ts">
    import { Button, Heading } from "flowbite-svelte";
    import LoadingIframe from "./LoadingIframe.svelte";
    import { page } from "$app/stores";
    import PlaceholderBox from "../../PlaceholderBox.svelte";
    import RenderedChords from "./RenderedChords.svelte";
    import { Fa } from "svelte-fa";
    import Tags from "svelte-tags-input";
    import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
    export let data;

    let currentTags = [...data.songFolder.metadata.tags];
    let newTags = [...data.songFolder.metadata.tags];
    let savingTags = false;
    let error = "";
    $: newTags, handleTagsChange();


    function arrayEquals(a: Array<string>, b: Array<string>) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    async function handleTagsChange() {
        if (savingTags) return;
        // if (currentTags != newTags) {
        if (! arrayEquals(currentTags, newTags)) {
            savingTags = true;
            console.log("saving", currentTags, newTags);

            error = "";
            const res = await fetch(`/api/song/${data.songFolder.metadata.id}/tags`, {
                    method: 'POST',
                    body: JSON.stringify({tags: newTags})
                })
            .then(async function(response) {
                if (!response.ok){
                    console.error("Failed updating song tags: ", response);
                    let responseText = await response.text();
                    error = response.status + " " + response.statusText + ": " + responseText;
                } else {
                    console.log(`Updated song tags: ${newTags}`);
                    // let responseJson = await response.json();
                    currentTags = [...newTags];
                    savingTags = false;
                }
            });
        }
    }

    // TODO: fix typings
    // @ts-ignore
    let TagsAndHideTypeWarning: ConstructorOfATypedSvelteComponent = Tags;
</script>

<section>
    <TagsAndHideTypeWarning
        bind:tags={newTags}
        addKeys={savingTags ? [] : null}
        removeKeys={[]}
        maxTags={25}
        allowPaste={true}
        allowDrop={true}
        splitWith={"/"}
        onlyUnique={true}
        placeholder={savingTags ? "saving..." : "You can add tags for your song"}
        name={"songTags"}
        id={"songTags"}
        allowBlur={true}
        disable={false} 
        readonly={false}
        autoComplete={data.allTags}
    />
    <!--
    on:tags={handleTagsChange}
    bind:tags={newTags}
    addKeys={[9]}
    removeKeys={[27]}
    autoComplete={['tag1', 'tag2']}
    onlyAutocomplete
    labelText="Label"
    labelShow
    minChars={3}
     -->
</section>

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
        <Button href="{$page.url.href}/sheet/edit">Add Lyrics/Chords</Button>
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

    :global(.svelte-tags-input-tag) {
        line-height: 2em;
    }

</style>