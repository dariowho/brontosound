<script lang="ts">
    import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import { fetchApi } from '$lib/db';

    /** The song's tags, saved as soon as one is added or removed, when `editable` */
    let { songId, initialTags, allTags, editable }: { songId: number, initialTags: string[], allTags: string[], editable: boolean } = $props();

    let tags = $state(initialTags);
    let adding = $state(false);
    let newTag = $state('');
    let error = $state<string | null>(null);
    let input = $state<HTMLInputElement>();

    $effect(() => input?.focus());

    async function save(updated: string[]) {
        error = null;
        try {
            await fetchApi(`/api/song/${songId}/tags`, { method: 'POST', body: JSON.stringify({ tags: updated }) });
            tags = updated;
        } catch (e) {
            error = `Couldn't save the tags: ${(e as Error).message}`;
        }
    }

    function addTag() {
        const tag = newTag.trim();
        if (tag && !tags.includes(tag)) save([...tags, tag]);
        newTag = '';
        adding = false;
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key == 'Enter') addTag();
        if (event.key == 'Escape') adding = false;
    }
</script>

<div class="flex flex-wrap items-center gap-2">
    {#each tags as tag (tag)}
        <span class="inline-flex items-center gap-0.5 rounded bg-primary-100 py-0.5 pl-2.5 {editable ? 'pr-1' : 'pr-2.5'} text-xs font-medium text-primary-900">
            {tag}
            {#if editable}
                <button type="button" class="inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-primary-200" aria-label="Remove the tag {tag}" title="Remove the tag"
                    onclick={() => save(tags.filter(t => t != tag))}><Fa icon={faXmark} size="xs" /></button>
            {/if}
        </span>
    {/each}
    {#if editable && adding}
        <input bind:this={input} bind:value={newTag} onkeydown={onKeydown} onblur={addTag} list="all-song-tags" placeholder="jazz" aria-label="New tag"
            class="h-7 w-36 rounded border border-gray-300 px-2 text-sm focus:border-primary-500 focus:ring-primary-500" />
        <datalist id="all-song-tags">{#each allTags as tag}<option value={tag}></option>{/each}</datalist>
    {:else if editable}
        <button type="button" class="inline-flex items-center gap-1.5 px-1 py-0.5 text-sm font-medium text-primary-800 hover:text-primary-900" onclick={() => adding = true}>
            <Fa icon={faPlus} size="xs" />Add tag
        </button>
    {/if}
    {#if error}<span class="text-sm text-red-700">{error}</span>{/if}
</div>
