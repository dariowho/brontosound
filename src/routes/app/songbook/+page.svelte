<script lang="ts">
  import slugify from 'slugify'
  import { onMount } from 'svelte';

  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, Badge, Spinner, Button, Heading, P, Input} from 'flowbite-svelte';
  import { PlusOutline, RefreshOutline } from 'flowbite-svelte-icons';

  import { Song } from '$lib/dbEntities/song.js';
  import type { StoredDirectory } from '$lib/dbEntities/storage';
    import { instanceToPlain, plainToClass } from 'class-transformer';
  
  export let data;
  let songs = data.songs as Song[];
  let cachedStoredDirs = data.cachedStoredDirs as StoredDirectory[];
  console.log(data);

  // Sync with remote storage
  let syncing = false;
  const syncAfterSeconds = 60;
  onMount(() => {
    if (!syncing && (new Date().getTime() - new Date(data.lastCacheSync).getTime()) / 1000 > syncAfterSeconds) {
      syncStoredDirs();
    } else {
      console.log("skipping sync");
    }
  });
  async function syncStoredDirs() {
    if (syncing) return;
    syncing = true;
    await fetch('/api/storage/songsFolder')
      .then(response => {
        if (!response.ok) {
          console.error("Remote sync failed: ", response);
          throw new Error("Remote sync failed: " + response.statusText);
        }
        return response.json()
      })
      .then(data => {
        console.log('Synced', data);
        cachedStoredDirs = data as unknown as StoredDirectory[];
        syncing = false;
      });
  }


  // Reconcile DB with stored directories. We use the remote storage path to link stored directory
  // with Song objects (which are mapped to DB records)
  let newSongs: Song[] = []; // New Song objects representing directories in cachedStoredDirs that don't have an existing Song in "songs". (i.e. there is no song so that song.storagePath matches)
  let deletedSongIds: string[] = []; // Songs that are in DB but not in cachedStoredDirs
  let songFromDirName: { [key: number]: Song } = {};
  let dirFromName: { [key: string]: StoredDirectory } = {};

  $: cachedStoredDirs, reconcileSongs()

  function reconcileSongs() {
    let newNewSongs: Song[] = [];
    let newDeletedSongIds: string[] = [];

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

    songs.forEach(song => {
      if (!dirFromName[song.title]) {
        newDeletedSongIds.push(song.storedDirName);
      }
    });

    newSongs = newNewSongs;
    deletedSongIds = newDeletedSongIds;

    console.log('newSongs', newSongs);
    // console.log('deletedSongs', deletedSongIds);
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
    console.log('saving new song:', song);
    const res = await fetch(`/api/song`, {
        method: 'POST',
        body: JSON.stringify(instanceToPlain(song))
    })
      .then(response => {
        if (!response.ok) {
          // TODO: test
          console.error("Failed to save song:", response);
          throw new Error("Failed to save song: " + response.statusText);
        }
        return response.json()
      })
      .then(json_response => {
        console.log('Saved song:', json_response);
        let song = plainToClass(Song, json_response);
        songs.push(song);
        songs = songs;
        reconcileSongs();
        return song;
      });
    syncing = false;
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

    {#each songs as song}
      <TableBodyRow>
        <!-- <TableBodyCell class="!p-4">
          <Checkbox />
        </TableBodyCell> -->
        <TableBodyCell>
          <a href="{buildSongURL(song)}">
            {song.title}
          </a>
        </TableBodyCell>
        <TableBodyCell>{song.artist}</TableBodyCell>
        <TableBodyCell>{song.creationDate.toLocaleDateString('it-IT')}</TableBodyCell>
        <TableBodyCell>
          {#each song.tags as songTag}
            <Badge>{songTag}</Badge> 
          {/each}
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
        <TableBodyCell>
          <Input placeholder="Title" bind:value={newSong.title} disabled={syncing} />
        </TableBodyCell>
        <TableBodyCell>
          <Input placeholder="Artist" bind:value={newSong.artist} disabled={syncing} />
        </TableBodyCell>
        <!-- <TableBodyCell>{song.creationDate.toLocaleDateString('it-IT')}</TableBodyCell> -->
        <!-- <TableBodyCell>
          {#each song.tags as songTag}
            <Badge>{songTag}</Badge> 
          {/each}
        </TableBodyCell> -->
        <TableBodyCell>
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