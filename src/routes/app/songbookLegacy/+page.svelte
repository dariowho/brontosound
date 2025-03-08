<script lang="ts">
  import slugify from 'slugify'

  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, Badge} from 'flowbite-svelte';
  
  import type { IndexedSongFolderData } from '$lib/songs.js';
    import type { StoredDirectory } from '$lib/storage.js';
  
  export let data;

  function buildSongURL(songFolder: StoredDirectory | IndexedSongFolderData) {
    if ('metadata' in songFolder) {
      return '/app/songbook/' + songFolder.metadata.id
    }

    const songSlug = slugify(songFolder.name)
    const query = new URLSearchParams({folderName: songFolder.name})
    return '/app/songbook/' + songSlug + '?' + query;
  }

  function songMetadata(songFolder: StoredDirectory | IndexedSongFolderData) {
    if ('metadata' in songFolder) return songFolder.metadata;

    return {
      id: null,
      author: '',
      title: songFolder.name,
      tags: []
    }
  }
</script>

<Table hoverable={true}>
    <TableHead>
      <TableHeadCell class="!p-4">
        <Checkbox />
      </TableHeadCell>
      <TableHeadCell>Song Name</TableHeadCell>
      <TableHeadCell>Author</TableHeadCell>
      <TableHeadCell>Added</TableHeadCell>
      <TableHeadCell>Tags</TableHeadCell>
      <!-- <TableHeadCell>
        <span class="sr-only"> Edit </span>
      </TableHeadCell> -->
    </TableHead>
    <TableBody>

      {#each data.songs as song}
        <TableBodyRow>
          <TableBodyCell class="!p-4">
            <Checkbox />
          </TableBodyCell>
          <TableBodyCell>
            <a href="{buildSongURL(song)}">
              {songMetadata(song).title}
            </a>
          </TableBodyCell>
          <TableBodyCell>{songMetadata(song).author}</TableBodyCell>
          <TableBodyCell>{song.creationDate.toLocaleDateString('it-IT')}</TableBodyCell>
          <TableBodyCell>
            {#each songMetadata(song).tags as songTag}
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