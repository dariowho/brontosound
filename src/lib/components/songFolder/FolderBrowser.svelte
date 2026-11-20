<script lang="ts">
    import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import type { SongFile } from '$lib/songFiles/songFile';
    import FileTile from './FileTile.svelte';

    /** The song folder as icons, browsable into subfolders */
    let { rootName, folderPath, files, error, isInViewer, isInPlayer, isPinned, onBrowse, onOpen }: {
        rootName: string, // the song folder's name
        folderPath: string, // relative to the song folder, "" for the song folder
        files: SongFile[],
        error: string | null,
        isInViewer: (file: SongFile) => boolean,
        isInPlayer: (file: SongFile) => boolean,
        isPinned: (file: SongFile) => boolean,
        onBrowse: (folderPath: string) => void,
        onOpen: (file: SongFile) => void,
    } = $props();

    /** The folders from the song folder down to this one, each with its path */
    let crumbs = $derived([
        { name: rootName, path: '' },
        ...folderPath.split('/').filter(Boolean).map((name, i, names) => ({ name, path: names.slice(0, i + 1).join('/') })),
    ]);
</script>

<section aria-label="Song folder" class="rounded-lg border border-gray-200">
    <div class="flex min-h-[48px] flex-wrap items-center justify-between gap-3 border-b border-gray-200 py-1.5 pl-5 pr-4">
        <nav aria-label="Folder" class="flex flex-wrap items-center gap-2 font-mono text-[15px]">
            {#each crumbs as crumb, i (crumb.path)}
                {#if i > 0}<Fa icon={faChevronRight} size="xs" class="text-gray-400" />{/if}
                {#if i < crumbs.length - 1}
                    <button type="button" class="text-primary-800 hover:text-primary-900" onclick={() => onBrowse(crumb.path)}>{crumb.name}</button>
                {:else}
                    <span aria-current="location" class="text-gray-900">{crumb.name}</span>
                {/if}
            {/each}
        </nav>
        <span class="text-[13px] text-gray-500">{files.length} {files.length == 1 ? 'item' : 'items'}</span>
    </div>

    {#if error}
        <p class="px-5 py-8 text-sm text-gray-600">Brontosound can't read this folder: {error}</p>
    {:else if files.length == 0}
        <p class="px-5 py-8 text-sm text-gray-600">This folder is empty. Add files to it in your storage, then sync.</p>
    {:else}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2 p-4">
            {#each files as file (file.path)}
                <FileTile {file} inViewer={isInViewer(file)} inPlayer={isInPlayer(file)} pinned={isPinned(file)} onOpen={() => onOpen(file)} />
            {/each}
        </div>
    {/if}
</section>
