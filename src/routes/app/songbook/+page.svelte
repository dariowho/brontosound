<script lang="ts">
  import { onMount } from 'svelte';
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Badge, Spinner, Button, Input, Alert } from 'flowbite-svelte';
  import { faMusic, faPlus, faRotate, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import slugify from 'slugify';

  import { Song } from '$lib/dbEntities/song.js';
  import type { StoredDirectory } from '$lib/dbEntities/storage';
  import { fetchApi, saveEntityViaApi } from '$lib/db';
  import { reconcileSongs } from '$lib/songbook';
  import PageTitle from '$lib/components/PageTitle.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import NewSongForm from './NewSongForm.svelte';
  import DeletedSongs from './DeletedSongs.svelte';

  let { data } = $props();
  let songs = $state(data.songs as Song[]);
  let cachedStoredDirs = $state(data.cachedStoredDirs as StoredDirectory[]);
  let lastCacheSync = $state(data.lastCacheSync);

  // Songs are linked to storage folders by folder name
  let reconciled = $derived(reconcileSongs(songs, cachedStoredDirs));
  // Folders with no song yet, as editable new songs
  let newSongs = $state<Song[]>([]);
  $effect(() => {
    newSongs = reconciled.newDirs.map(dir => ({ title: dir.name, artist: "", storedDirName: dir.name, deleted: false }) as Song);
  });

  let busy = $state(false);
  let errorMessage: string | null = $state(null);
  let showNewSongForm = $state(false);
  let showDeletedSongs = $state(false);

  /** Run a Songbook change, then sync with remote storage so folders and songs line up again */
  async function update(failure: string, change: () => Promise<unknown>) {
    if (busy) return;
    busy = true;
    errorMessage = null;
    try {
      await change();
      cachedStoredDirs = await fetchApi('/api/storage/songsFolder');
      lastCacheSync = new Date();
    } catch (e) {
      errorMessage = `${failure}: ${(e as Error).message}`;
    } finally {
      busy = false;
    }
  }

  const sync = () => update("Sync with remote storage failed", async () => {});

  const saveSong = (song: Song) => update("Failed to save song", async () => {
    const saved = await saveEntityViaApi(Song, song, '/api/song');
    songs = [...songs.filter(s => s.id !== saved.id), saved];
  });

  const createSong = (title: string, artist: string) => {
    showNewSongForm = false;
    return saveSong({ title, artist, storedDirName: title.replaceAll('/', '-'), deleted: false } as Song);
  };

  const deleteSong = (song: Song) => update("Failed to delete song", async () => {
    await fetchApi(`/api/song/${song.id}`, { method: 'DELETE' });
    songs = songs.filter(s => s.id !== song.id);
  });

  const syncAfterSeconds = 180;
  onMount(() => {
    if ((Date.now() - new Date(data.lastCacheSync).getTime()) / 1000 > syncAfterSeconds) sync();
  });

  function syncedAgo(date: Date | string | null) {
    if (!date) return "Never synced";
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return "Synced just now";
    if (minutes < 60) return `Synced ${minutes} minute${minutes == 1 ? '' : 's'} ago`;
    return `Synced ${new Date(date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}`;
  }

  const buildSongURL = (song: Song) => `/app/songbook/${song.id}/${slugify(song.title)}`;
</script>

<PageTitle title="Songbook">
  {#snippet actions()}
    <span class="text-sm text-gray-500">{busy ? "Syncing…" : syncedAgo(lastCacheSync)}</span>
    <Button color="alternative" disabled={busy} onclick={sync}>
      {#if busy}<Spinner size="4" class="me-2" />{:else}<Fa icon={faRotate} class="me-2" />{/if}Sync storage
    </Button>
    {#if reconciled.existing.length > 0}
      <Button onclick={() => showNewSongForm = !showNewSongForm}><Fa icon={faPlus} class="me-2" />New song</Button>
    {/if}
  {/snippet}
</PageTitle>

{#if errorMessage}
  <Alert color="red" class="mb-4">{errorMessage}</Alert>
{/if}

{#if showNewSongForm}
  <div class="mb-6 rounded-lg border border-gray-200 p-6">
    <NewSongForm songsFolder={data.songsFolder} {busy} onCreate={createSong} />
  </div>
{/if}

<Table hoverable={reconciled.existing.length > 0}>
  <TableHead>
    <TableHeadCell>Song name</TableHeadCell>
    <TableHeadCell>Artist</TableHeadCell>
    <TableHeadCell>Added</TableHeadCell>
    <TableHeadCell>Tags</TableHeadCell>
  </TableHead>
  <TableBody>
    {#each reconciled.existing as song (song.id)}
      <TableBodyRow>
        <TableBodyCell><a href={buildSongURL(song)} class="text-gray-900 hover:text-primary-800">{song.title}</a></TableBodyCell>
        <TableBodyCell class="font-normal text-gray-600">{song.artist}</TableBodyCell>
        <TableBodyCell class="font-normal text-gray-600">{new Date(song.creationDate).toLocaleDateString('it-IT')}</TableBodyCell>
        <TableBodyCell>
          {#each song.tags ?? [] as tag}
            <Badge class="mr-2">{tag.name}</Badge>
          {/each}
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan={4}>
          <EmptyState icon={faMusic} title="There are no songs in your Songbook yet">
            <p class="text-sm font-normal text-gray-600">Create your first song here. Already have song folders in your storage? Sync storage and they will show up under New songs.</p>
            <div class="mt-3 w-full font-normal"><NewSongForm songsFolder={data.songsFolder} {busy} onCreate={createSong} /></div>
          </EmptyState>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>

{#if newSongs.length > 0}
  <h2 class="mb-2 mt-14 text-4xl font-bold text-gray-900">New songs</h2>
  <p class="mb-4 text-sm text-gray-700">These folders were found in your storage, but are not yet in your Songbook: add them!</p>
  <Table>
    <TableHead>
      <TableHeadCell>Storage path</TableHeadCell>
      <TableHeadCell class="px-2">Song name</TableHeadCell>
      <TableHeadCell class="px-2">Artist</TableHeadCell>
      <TableHeadCell class="w-px"><span class="sr-only">Add</span></TableHeadCell>
    </TableHead>
    <TableBody>
      {#each newSongs as newSong, i (newSong.storedDirName)}
        <TableBodyRow>
          <TableBodyCell class="font-mono font-normal text-gray-700">{reconciled.newDirs[i]?.path}</TableBodyCell>
          <TableBodyCell class="px-2"><Input aria-label="Song name" class="min-w-40" bind:value={newSong.title} disabled={busy} /></TableBodyCell>
          <TableBodyCell class="px-2"><Input aria-label="Artist" class="min-w-40" placeholder="Artist" bind:value={newSong.artist} disabled={busy} /></TableBodyCell>
          <TableBodyCell class="w-px py-3 pl-2"><Button disabled={busy} onclick={() => saveSong(newSong)}><Fa icon={faPlus} class="me-2" />Add</Button></TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
{/if}

{#if reconciled.deleted.length > 0}
  <button class="mt-10 inline-flex items-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700" onclick={() => showDeletedSongs = !showDeletedSongs}>
    <Fa icon={showDeletedSongs ? faChevronUp : faChevronDown} size="xs" />
    {showDeletedSongs ? 'Hide' : 'Show'} {reconciled.deleted.length} deleted song{reconciled.deleted.length == 1 ? '' : 's'}
  </button>
  {#if showDeletedSongs}
    <h2 class="mb-2 mt-4 text-4xl font-bold text-gray-900">Deleted songs</h2>
    <p class="mb-1 text-sm text-gray-700">These songs are in your Songbook, but their folder was not found in your storage. If this is unexpected, check your storage settings.</p>
    <p class="mb-4 text-sm text-gray-500"><strong class="font-medium text-gray-700">Re-create folder</strong> makes an empty folder for the song in your storage. <strong class="font-medium text-gray-700">Delete</strong> removes the song from your Songbook for good.</p>
    <DeletedSongs songs={reconciled.deleted} {busy} onRecreate={saveSong} onDelete={deleteSong} />
  {/if}
{/if}
