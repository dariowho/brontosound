<script lang="ts">
    import { faChevronRight, faUpload } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import type { SongFile } from '$lib/songFiles/songFile';
    import type { Upload } from '$lib/songFiles/upload';
    import FileTile from './FileTile.svelte';
    import UploadTile from './UploadTile.svelte';

    /**
     * The song folder as icons, browsable into subfolders. When `editable`, files dropped on it, or picked with Upload,
     * go into the folder shown.
     */
    let { editable, rootName, folderPath, storagePath, files, uploads, error, isInViewer, isInPlayer, isPinned, onBrowse, onOpen, onUpload, onDismissUpload }: {
        editable: boolean,
        rootName: string, // the song folder's name
        folderPath: string, // relative to the song folder, "" for the song folder
        storagePath: string, // the folder's path in storage, to say where uploads go
        files: SongFile[],
        uploads: Upload[], // into this folder
        error: string | null,
        isInViewer: (file: SongFile) => boolean,
        isInPlayer: (file: SongFile) => boolean,
        isPinned: (file: SongFile) => boolean,
        onBrowse: (folderPath: string) => void,
        onOpen: (file: SongFile) => void,
        onUpload: (files: File[]) => void,
        onDismissUpload: (upload: Upload) => void,
    } = $props();

    /** The folders from the song folder down to this one, each with its path */
    let crumbs = $derived([
        { name: rootName, path: '' },
        ...folderPath.split('/').filter(Boolean).map((name, i, names) => ({ name, path: names.slice(0, i + 1).join('/') })),
    ]);

    let picker: HTMLInputElement;
    let dragged = $state(0); // files being dragged over the folder; 0 when none
    let depth = 0; // dragenter and dragleave fire for every child element

    const hasFiles = (event: DragEvent) => editable && !!event.dataTransfer?.types.includes('Files');

    function dragEnter(event: DragEvent) {
        if (!hasFiles(event)) return;
        depth++;
        dragged = event.dataTransfer!.items.length;
    }

    function dragLeave(event: DragEvent) {
        if (hasFiles(event) && --depth == 0) dragged = 0;
    }

    function drop(event: DragEvent) {
        if (!hasFiles(event)) return;
        event.preventDefault();
        depth = dragged = 0;
        onUpload([...event.dataTransfer!.files]);
    }

    function picked() {
        onUpload([...picker.files ?? []]);
        picker.value = '';
    }
</script>

<section aria-label="Song folder" class="relative rounded-lg border border-gray-200 {dragged ? 'min-h-[220px]' : ''}"
    ondragenter={dragEnter} ondragleave={dragLeave} ondragover={event => hasFiles(event) && event.preventDefault()} ondrop={drop}>
    <div class="flex min-h-[48px] flex-wrap items-center justify-between gap-3 border-b border-gray-200 py-1.5 pl-4 pr-3 sm:pl-5 sm:pr-4">
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
        <div class="flex items-center gap-3 sm:gap-4">
            <span class="text-[13px] text-gray-500">{files.length} {files.length == 1 ? 'item' : 'items'}</span>
            {#if editable}
                <button type="button" onclick={() => picker.click()}
                    class="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-300 sm:h-9">
                    <Fa icon={faUpload} size="sm" />Upload
                </button>
                <input bind:this={picker} type="file" multiple hidden onchange={picked} />
            {/if}
        </div>
    </div>

    {#if error}
        <p class="px-5 py-8 text-sm text-gray-600">Brontosound can't read this folder: {error}</p>
    {:else if files.length == 0 && uploads.length == 0}
        <p class="px-5 py-8 text-sm text-gray-600">This folder is empty.{editable ? ' Drop files here or upload them.' : ''}</p>
    {:else}
        <div class="grid grid-cols-3 gap-2 p-3 sm:grid-cols-[repeat(auto-fill,minmax(112px,1fr))] sm:p-4">
            {#each files as file (file.path)}
                <FileTile {file} inViewer={isInViewer(file)} inPlayer={isInPlayer(file)} pinned={isPinned(file)} onOpen={() => onOpen(file)} />
            {/each}
            {#each uploads as upload}
                <UploadTile {upload} onDismiss={() => onDismissUpload(upload)} />
            {/each}
        </div>
    {/if}

    {#if dragged}
        <div class="pointer-events-none absolute -inset-px flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-primary-500 bg-primary-50/95 px-6 text-center">
            <span class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700"><Fa icon={faUpload} size="lg" /></span>
            <p class="text-xl font-bold text-gray-900">Drop to upload {dragged} {dragged == 1 ? 'file' : 'files'}</p>
            <p class="text-sm text-gray-600">They're saved in <span class="font-mono">{storagePath}</span> in your storage.</p>
        </div>
    {/if}
</section>
