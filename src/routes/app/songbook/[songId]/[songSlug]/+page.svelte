<script lang="ts">
    import { Button, Heading, Spinner } from "flowbite-svelte";
    import LoadingIframe from "./LoadingIframe.svelte";
    import { page } from "$app/stores";
    import PlaceholderBox from "$lib/components/PlaceholderBox.svelte";
    import RenderedChords from "./RenderedChords.svelte";
    import { Fa } from "svelte-fa";
    // @ts-ignore() - svelte-tags-input does not export types"
    import Tags from "svelte-tags-input";
    import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
    import type { SongTag } from "$lib/dbEntities/song";
    import { extractYTVideoUrl, type YTVideoUrl } from "$lib/yt";
    import type { StoredFile } from "$lib/dbEntities/storage";
    import { arrayEquals } from "$lib/misc";
    import { SongFilenames, StoredSong } from "$lib/songbook";
    import { onMount } from "svelte";
    import { plainToInstance } from "class-transformer";
    import { RefreshOutline } from "flowbite-svelte-icons";
    export let data;

    // console.log(data);

    let song: StoredSong = plainToInstance(StoredSong, data.song);
    let readmeFile: StoredFile = data.readmeFile as StoredFile;
    let chordsFile: StoredFile = data.chordsFile as StoredFile;
    
    let readme: string, chords: string, ytUrl: YTVideoUrl = null;
    $: if (readmeFile) readme = readmeFile.content;
    $: if (chordsFile) chords = chordsFile.content;
    $: if (readme) { ytUrl = extractYTVideoUrl(readme)}

    let currentTags: SongTag[]
    $: song, currentTags = [...data.song.tags].map((v) => v.name);
    let newTags: SongTag[] = [...data.song.tags].map((v) => v.name);
    let savingTags = false;
    $: if (newTags != null) handleTagsChange();

    let error = "";
    let syncing = false;

    onMount(() => {
        if (needsSync(readmeFile) || needsSync(chordsFile))  {
            sync();
        } else {
            console.log("skipping onMount sync");
        }
    });

    const syncAfterSeconds = 120;
    function needsSync(file: StoredFile): boolean {
        return (!syncing && (new Date().getTime() - new Date(file.lastVisited).getTime()) / 1000 > syncAfterSeconds)
    }

    async function fetchSongFile(filename:string): Promise<string> {
        const response = await fetch('/api/storage/file?' + new URLSearchParams({
            path: song.buildPath(filename)
        }).toString());
        // console.log(response);
        if (response.ok) {
            let data = (await response.json()) as StoredFile;
            return data.content;
        }

        if (response.status != 404) {
            console.error(`Fetch failed for ${filename}. Response:`, response)
            throw Error();
        }

        return null;
    }
    async function sync() {
        if (syncing) {
            return;
        }
        syncing = true;
        [readme, chords] = await Promise.all([
            fetchSongFile(SongFilenames.README),
            fetchSongFile(SongFilenames.CHORDS)
        ]);
        syncing = false;
    }
    
    async function handleTagsChange() {
        // console.log("MOCK saving out", currentTags, newTags);
        if (savingTags) return;

        if (! arrayEquals(currentTags, newTags)) {
            savingTags = true;
            const response = await fetch(`/api/song/${song.id}/tags`, {
                method: 'POST',
                body: JSON.stringify({tags: newTags})
            })
            if (response.ok) {
                let responseJson = await response.json();
                console.log(`Updated song:`, responseJson);
                song = plainToInstance(StoredSong, responseJson);
                // currentTags = [...responseJson];
                savingTags = false;
            } else {
                console.error("Failed updating song tags: ", response);
                let responseText = await response.text();
                error = response.status + " " + response.statusText + ": " + responseText;
            }
            savingTags = false;
        }
    }

    // TODO: fix typings
    // @ts-ignore
    let TagsAndHideTypeWarning: ConstructorOfATypedSvelteComponent = Tags;
</script>

<div id="syncStatus">
    {#if syncing}
      <span title="Sync with remote storage in progress..."><Button color="alternative" disabled><Spinner size="5" /></Button></span>
    {:else}
      <span><Button on:click={sync}><RefreshOutline /></Button></span>
    {/if}  
</div>

<section>
    <!-- <TagsAndHideTypeWarning -->
    <Tags
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
    {#if ytUrl}
        <!-- TODO: Make invidious instance confgurable -->
        <div class="flex flex-wrap items-center gap-2 sectionButtons">
            <Button class="!p-2" href="{$page.url.href}/readme/edit"><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        <LoadingIframe width='100%' height='200px' src='https://inv.nadeko.net/embed/{ytUrl.id}?listen=1&autoplay=0&thin_mode=true&player_style=youtube' />    
    {:else}
        <PlaceholderBox>
            <Button href="{$page.url.href}/readme/edit">Add YouTube link</Button>
            <p style="color: gray; font-size: 0.8em; font-style: italic; margin-top: 1em;">YouTube links are extracted from the song's README.md</p>
        </PlaceholderBox>
    {/if}
</section>

<section>
    <!-- TODO: chords not updating after manual sync -->
    {#if chords}
        <div class="flex flex-wrap items-center gap-2 sectionButtons">
            <Button class="!p-2" href="{$page.url.href}/sheet/edit"><Fa icon={faPenToSquare} size="lg" /></Button>
        </div>
        <div class="chords">
            <RenderedChords rawChords={chords} />
        </div>
    {:else}
    <PlaceholderBox>
        <Button href="{$page.url.href}/sheet/edit">Add Lyrics/Chords</Button>
    </PlaceholderBox>
    {/if}
</section>

<!-- <section>
    <PlaceholderBox>
        <p>(raw file list)</p>
    </PlaceholderBox>
</section> -->

<style>
    #syncStatus {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1rem;
    }
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