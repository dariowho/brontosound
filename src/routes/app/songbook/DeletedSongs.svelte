<script lang="ts">
    import { Badge, Button, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import { faFolderPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import type { Song } from '$lib/dbEntities/song';

    /** Songs whose folder is gone from storage: re-create the folder, or delete the song after an inline confirmation */
    let { songs, busy, onRecreate, onDelete }: {
        songs: Song[],
        busy: boolean,
        onRecreate: (song: Song) => Promise<unknown>,
        onDelete: (song: Song) => Promise<unknown>,
    } = $props();

    let confirmingId: number | null = $state(null);
</script>

<Table>
    <TableHead>
        <TableHeadCell>Song name</TableHeadCell>
        <TableHeadCell>Artist</TableHeadCell>
        <TableHeadCell>Added</TableHeadCell>
        <TableHeadCell>Tags</TableHeadCell>
        <TableHeadCell class="text-right">Actions</TableHeadCell>
    </TableHead>
    <TableBody>
        {#each songs as song (song.id)}
            {#if song.id === confirmingId}
                <TableBodyRow class="border-red-300 bg-red-50">
                    <TableBodyCell colspan={5} class="whitespace-normal py-3 font-normal text-gray-900">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <span>Delete <strong>{song.title}</strong>{song.artist ? ` (${song.artist})` : ''} permanently? It will be removed from your Songbook with its tags. This can't be undone.</span>
                            <span class="flex gap-2">
                                <Button size="sm" color="alternative" onclick={() => confirmingId = null}>Cancel</Button>
                                <Button size="sm" color="red" disabled={busy} onclick={async () => { await onDelete(song); confirmingId = null; }}>Delete permanently</Button>
                            </span>
                        </div>
                    </TableBodyCell>
                </TableBodyRow>
            {:else}
                <TableBodyRow>
                    <TableBodyCell class="font-normal text-gray-500">{song.title}</TableBodyCell>
                    <TableBodyCell class="font-normal text-gray-500">{song.artist}</TableBodyCell>
                    <TableBodyCell class="font-normal text-gray-500">{new Date(song.creationDate).toLocaleDateString('it-IT')}</TableBodyCell>
                    <TableBodyCell>
                        {#each song.tags ?? [] as tag}
                            <Badge color="dark" class="mr-2">{tag.name}</Badge>
                        {/each}
                    </TableBodyCell>
                    <TableBodyCell class="w-px py-2 text-right">
                        <span class="inline-flex gap-2">
                            <Button size="sm" color="alternative" disabled={busy} onclick={() => onRecreate(song)}><Fa icon={faFolderPlus} class="me-2" />Re-create folder</Button>
                            <Button size="sm" color="red" outline disabled={busy} onclick={() => confirmingId = song.id}><Fa icon={faTrashCan} class="me-2" />Delete</Button>
                        </span>
                    </TableBodyCell>
                </TableBodyRow>
            {/if}
        {/each}
    </TableBody>
</Table>
