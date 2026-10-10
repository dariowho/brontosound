<script lang="ts">
  import slugify from 'slugify'
  import { onMount } from 'svelte';

  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, Badge, Spinner, Button, Heading, P, Input, Alert} from 'flowbite-svelte';
  import { PlusOutline, RefreshOutline } from 'flowbite-svelte-icons';

  import { Song } from '$lib/dbEntities/song.js';
  import type { StoredDirectory } from '$lib/dbEntities/storage';
  import { fetchApi, saveEntityViaApi } from '$lib/db';
  
  export let data;
  let songs = data.songs as Song[];
  let cachedStoredDirs = data.cachedStoredDirs as StoredDirectory[];
  // console.log(data);

  $: songs

  // Sync with remote storage
  let syncing = false;
  let syncError: string | null = null;
  const syncAfterSeconds = 180;
  onMount(() => {
    if (!syncing && (new Date().getTime() - new Date(data.lastCacheSync).getTime()) / 1000 > syncAfterSeconds) {
      syncStoredDirs();
    } else {
      console.log("skipping sync");
    }
  });

  // TODO: dir list not updating after new song insert
  async function syncStoredDirs() {
    if (syncing) return;
    syncing = true;
    syncError = null;
    try {
      cachedStoredDirs = await fetchApi('/api/storage/songsFolder');
      data.lastCacheSync = new Date();
    } catch (e) {
      syncError = `Sync with remote storage failed: ${(e as Error).message}`;
    } finally {
      syncing = false;
    }
  }


  // Reconcile DB with stored directories. We use the remote storage path to link stored directory
  // with Song objects (which are mapped to DB records)
  let newSongs: Song[] = []; // New Song objects representing directories in cachedStoredDirs that don't have an existing Song in "songs". (i.e. there is no song so that song.storagePath matches)
  let existingSongs: Song[] = []; // Songs that are in DB and in cachedStoredDirs
  let deletedSongs: Song[] = []; // Songs that are in DB but not in cachedStoredDirs
  let showDeletedSongs = false;
  let songFromDirName: { [key: number]: Song } = {};
  let dirFromName: { [key: string]: StoredDirectory } = {};

  $: cachedStoredDirs, reconcileSongs()

  function reconcileSongs() {
    let newNewSongs: Song[] = [];

    songFromDirName = {};
    songs.forEach(song => {
      songFromDirName[song.storedDirName] = song;
    });

    dirFromName = {};
    cachedStoredDirs.forEach(cachedDir => {
      dirFromName[cachedDir.name] = cachedDir;
      if (!songFromDirName[cachedDir.name]) {
        newNewSongs.push(buildNewSongFromDir(cachedDir));
      }
    });

    newSongs = newNewSongs;
    existingSongs = songs.filter(song => dirFromName[song.title]);
    deletedSongs = songs.filter(song => !dirFromName[song.title]);

    // console.log('newSongs', newSongs);
    // console.log('deletedSongs', deletedSongs);
  }

  function buildNewSongFromDir(dir: StoredDirectory): Song {
    let result: Song = new Song()
    result.artist = "";
    result.title = dir.name;
    result.storedDirName = dir.name;
    result.deleted = false;
    return result;
    // db.manager.save(result);
  }
  
  async function saveNewSong(song: Song) {
    syncing = true;
    syncError = null;
    try {
      songs = [...songs, await saveEntityViaApi(Song, song, '/api/song')];
      reconcileSongs();
    } catch (e) {
      syncError = `Failed to save song: ${(e as Error).message}`;
    } finally {
      syncing = false;
    }
  }

  function buildSongURL(song: Song) {
    const songSlug = slugify(song.title)
    const query = new URLSearchParams({folderName: song.title})
    return '/app/songbook/' + song.id + "/" + songSlug;
  }
</script>

<div id="syncStatus">
  {#if syncing}
    <span title="Sync with remote storage in progress..."><Button color="alternative" disabled><Spinner size="5" /></Button></span>
  {:else}
    <span title="Last sync: {data.lastCacheSync}"><Button on:click={syncStoredDirs}><RefreshOutline /></Button></span>
  {/if}  
  
</div>

{#if syncError}
  <Alert color="red" class="mb-4">{syncError}</Alert>
{/if}

{#snippet songTable(tableSongs: Song[], deleted: boolean)}
  <Table hoverable={true}>
    <TableHead>
      <!-- <TableHeadCell class="!p-4">
        <Checkbox />
      </TableHeadCell> -->
      <TableHeadCell>Song Name</TableHeadCell>
      <TableHeadCell>Artist</TableHeadCell>
      <TableHeadCell>Added</TableHeadCell>
      <TableHeadCell>Tags</TableHeadCell>
      <!-- <TableHeadCell>
        <span class="sr-only"> Edit </span>
      </TableHeadCell> -->
    </TableHead>
    <TableBody>

      {#each tableSongs as song}
        <TableBodyRow class={deleted ? 'opacity-50' : ''}>
          <!-- <TableBodyCell class="!p-4">
            <Checkbox />
          </TableBodyCell> -->
          <TableBodyCell>
            {#if deleted}
              {song.title}
            {:else}
              <a href="{buildSongURL(song)}">
                {song.title}
              </a>
            {/if}
          </TableBodyCell>
          <TableBodyCell>{song.artist}</TableBodyCell>
          <TableBodyCell>{new Date(song.creationDate).toLocaleDateString('it-IT')}</TableBodyCell>
          <TableBodyCell>
            {#if song.tags}
              {#each song.tags.map((v) => v.name) as songTag}
                <Badge class="mr-2">{songTag}</Badge> 
              {/each}
            {/if}
          </TableBodyCell>
          <!-- <TableBodyCell>
            <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
              Edit
            </a>
          </TableBodyCell> -->
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
{/snippet}

{@render songTable(existingSongs, false)}

{#if newSongs.length >= 1}
<div class="title">
  <Heading tag="h2">New Songs</Heading>
</div>
<P size="sm" class="mb-3">These songs were found in your storage, but are not yet in your Songbook: add them!</P>
<Table hoverable={true} class="songTable">
  <TableHead>
    <TableHeadCell class="!p-4">
      Storage Path
    </TableHeadCell>
    <TableHeadCell>Song Name</TableHeadCell>
    <TableHeadCell>Artist</TableHeadCell>
    <!-- <TableHeadCell>Added</TableHeadCell> -->
    <!-- <TableHeadCell>Tags</TableHeadCell> -->
    <TableHeadCell>
      <span class="sr-only"> Add </span>
    </TableHeadCell>
  </TableHead>
  <TableBody>

    {#each newSongs as newSong}
      <TableBodyRow>
        <TableBodyCell class="!p-4">
          {dirFromName[newSong.storedDirName].path}
        </TableBodyCell>
        <TableBodyCell class="px-2">
          <div style="min-width:10rem;">
            <Input placeholder="Title" bind:value={newSong.title} disabled={syncing} />
          </div>
        </TableBodyCell>
        <TableBodyCell class="px-2">
          <div style="min-width:10rem;">
            <Input placeholder="Artist" bind:value={newSong.artist} disabled={syncing} />
          </div>
        </TableBodyCell>
        <!-- <TableBodyCell>{song.creationDate.toLocaleDateString('it-IT')}</TableBodyCell> -->
        <!-- <TableBodyCell>
          {#each song.tags as songTag}
            <Badge>{songTag}</Badge> 
          {/each}
        </TableBodyCell> -->
        <TableBodyCell class="px-2">
          {#if syncing}
            <span title="Sync with remote storage in progress..."><Button color="alternative" disabled><Spinner size="5" /></Button></span>
          {:else}
            <Button on:click={(song) => saveNewSong(newSong)}><PlusOutline /></Button>
          {/if}
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
{/if}

{#if deletedSongs.length >= 1}
<button class="mt-8 text-sm text-gray-500 hover:underline" on:click={() => showDeletedSongs = !showDeletedSongs}>
  {showDeletedSongs ? 'Hide' : 'Show'} {deletedSongs.length} deleted song{deletedSongs.length == 1 ? '' : 's'}
</button>
{#if showDeletedSongs}
<div class="title">
  <Heading tag="h2">Deleted Songs</Heading>
</div>
<P size="sm" class="mb-3">These songs are in your Songbook, but their folder was not found in your storage. If this is unexpected, check your storage settings.</P>
{@render songTable(deletedSongs, true)}
{/if}
{/if}

<style>
  #syncStatus {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .title {
    margin: 2rem 0 1rem 0;
  }
</style>