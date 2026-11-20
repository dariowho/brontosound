<script lang="ts">
    import { faRotate } from '@fortawesome/free-solid-svg-icons';
    import { Button } from 'flowbite-svelte';
    import Fa from 'svelte-fa';
    import SongTags from './SongTags.svelte';

    let { songId, title, tags, allTags, syncing, onSync }: {
        songId: number,
        title: string,
        tags: string[],
        allTags: string[],
        syncing: boolean,
        onSync: () => void,
    } = $props();
</script>

<div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div class="flex min-w-0 flex-col gap-3">
        <h1 class="break-words text-5xl font-bold tracking-tight text-gray-900">{title}</h1>
        <SongTags {songId} initialTags={tags} {allTags} />
    </div>
    <Button color="alternative" class="mt-1.5 whitespace-nowrap" disabled={syncing} onclick={onSync}>
        <Fa icon={faRotate} spin={syncing} class="me-2" />Sync folder
    </Button>
</div>
