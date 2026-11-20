<script lang="ts">
    import { faPencil, faRotate } from '@fortawesome/free-solid-svg-icons';
    import { Button } from 'flowbite-svelte';
    import Fa from 'svelte-fa';
    import { invalidateAll } from '$app/navigation';
    import { fetchApi } from '$lib/db';
    import SongTags from './SongTags.svelte';

    /** Title, artist and tags. Click the title or the artist to edit both, when `editable`. */
    let { songId, initialTitle, initialArtist, tags, allTags, editable, syncing, onSync }: {
        songId: number,
        initialTitle: string,
        initialArtist: string,
        tags: string[],
        allTags: string[],
        editable: boolean,
        syncing: boolean,
        onSync: () => void,
    } = $props();

    let title = $state(initialTitle);
    let artist = $state(initialArtist);
    let editing = $state<'title' | 'artist' | null>(null); // the field to focus
    let draftTitle = $state('');
    let draftArtist = $state('');
    let error = $state<string | null>(null);

    function edit(field: 'title' | 'artist') {
        draftTitle = title;
        draftArtist = artist;
        error = null;
        editing = field;
    }

    async function save() {
        try {
            ({ title, artist } = await fetchApi(`/api/song/${songId}`, { method: 'PATCH', body: JSON.stringify({ title: draftTitle, artist: draftArtist }) }));
            editing = null;
            invalidateAll(); // the breadcrumb and the page title
        } catch (e) {
            error = `Couldn't save: ${(e as Error).message}`;
        }
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key == 'Enter') save();
        if (event.key == 'Escape') editing = null;
    }

    const focusIf = (node: HTMLInputElement, focus: boolean) => { if (focus) node.focus(); };
    // The pencil shows on hover, and always on touch screens
    const editableText = 'group inline-flex max-w-[calc(100%+1.25rem)] items-center rounded-lg px-2.5 -mx-2.5 text-left hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300';
    const pencil = 'shrink-0 text-gray-400 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';
    const field = 'w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-900 focus:border-primary-500 focus:ring-primary-500';
</script>

<div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    {#if editing}
        <div class="flex w-full max-w-3xl flex-col gap-4">
            <label class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-900">Title</span>
                <input bind:value={draftTitle} onkeydown={onKeydown} use:focusIf={editing == 'title'} class="{field} py-1 text-3xl font-bold tracking-tight sm:text-5xl" />
            </label>
            <label class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-900">Artist</span>
                <input bind:value={draftArtist} onkeydown={onKeydown} use:focusIf={editing == 'artist'} placeholder="Optional" class="{field} h-12 text-xl font-medium" />
            </label>
            <div class="flex flex-wrap items-center gap-2">
                <Button onclick={save}>Save</Button>
                <Button color="alternative" onclick={() => editing = null}>Cancel</Button>
                {#if error}<span class="text-sm text-red-700">{error}</span>{/if}
            </div>
        </div>
    {:else}
        <div class="flex min-w-0 flex-col items-start gap-1">
            <h1 class="max-w-full break-words text-5xl font-bold tracking-tight text-gray-900">
                {#if editable}
                    <button type="button" class="{editableText} gap-3.5 break-words" onclick={() => edit('title')} aria-label="Edit title and artist: {title}">
                        {title}<Fa icon={faPencil} class="{pencil} text-xl" />
                    </button>
                {:else}
                    {title}
                {/if}
            </h1>
            {#if !editable}
                {#if artist}<p class="text-xl font-medium text-gray-600">{artist}</p>{/if}
            {:else if artist}
                <button type="button" class="{editableText} gap-2.5 text-xl font-medium text-gray-600" onclick={() => edit('artist')} aria-label="Edit title and artist: {artist}">
                    {artist}<Fa icon={faPencil} class="{pencil} text-sm" />
                </button>
            {:else}
                <button type="button" class="py-1 text-sm font-medium text-primary-800 hover:text-primary-900" onclick={() => edit('artist')}>+ Add artist</button>
            {/if}
            {#if editable || tags.length}
                <div class="mt-2"><SongTags {songId} initialTags={tags} {allTags} {editable} /></div>
            {/if}
        </div>
    {/if}
    <Button color="alternative" class="mt-1.5 whitespace-nowrap" disabled={syncing} onclick={onSync}>
        <Fa icon={faRotate} spin={syncing} class="me-2" />Sync folder
    </Button>
</div>
