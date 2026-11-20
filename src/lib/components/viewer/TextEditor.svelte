<script lang="ts">
    import { Spinner } from 'flowbite-svelte';
    import { beforeNavigate } from '$app/navigation';
    import { fileTypeLabel } from '$lib/songFiles/fileTypes';
    import { songFileUrl, type SongFile } from '$lib/songFiles/songFile';

    /**
     * A plain-text file, edited in place (full screen on phones). Ctrl+S saves;
     * leaving the page with unsaved changes asks first.
     */
    let { songId, file, dirty = $bindable(), onSave, onCancel }: {
        songId: number,
        file: SongFile,
        dirty: boolean,
        onSave: (text: string) => Promise<void>,
        onCancel: () => void,
    } = $props();

    let original = $state<string | null>(null);
    let text = $state('');
    let saving = $state(false);
    let error = $state<string | null>(null);

    $effect(() => {
        fetch(songFileUrl(songId, file)).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.text();
        }).then(content => original = text = content, e => error = `Couldn't open the file: ${e.message}`);
    });
    $effect(() => { dirty = original !== null && text != original; });

    async function save() {
        if (saving || original === null) return;
        saving = true;
        error = null;
        try {
            await onSave(text);
        } catch (e) {
            error = `Couldn't save: ${(e as Error).message}`;
        }
        saving = false;
    }

    function onKeydown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key == 's') {
            event.preventDefault();
            save();
        }
    }

    beforeNavigate(navigation => {
        if (!dirty) return;
        if (navigation.type == 'leave') navigation.cancel(); // closing the tab: the browser asks
        else if (!confirm(`Discard your changes to ${file.name}?`)) navigation.cancel();
    });

    const button = 'inline-flex h-10 shrink-0 items-center rounded-lg px-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-300 sm:h-9';
</script>

<svelte:window onkeydown={onKeydown} />

<div class="flex flex-col bg-white max-sm:fixed max-sm:inset-0 max-sm:z-50">
    <div class="flex min-h-[64px] items-center justify-between gap-2 border-b border-gray-200 px-3 py-2 sm:min-h-[60px] sm:gap-3 sm:pl-5 sm:pr-4">
        <button type="button" class="{button} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 sm:order-2" onclick={onCancel}>Cancel</button>
        <div class="flex min-w-0 flex-col items-center sm:order-1 sm:mr-auto sm:flex-row sm:items-baseline sm:gap-2.5">
            <span class="max-w-full truncate font-medium text-gray-900">{file.name}</span>
            <span class="text-xs text-gray-500 sm:text-[13px]">{dirty ? 'Unsaved changes' : fileTypeLabel(file)}</span>
        </div>
        <button type="button" class="{button} bg-primary-700 px-[18px] text-white hover:bg-primary-800 sm:order-3" disabled={saving || original === null} onclick={save}>
            {saving ? 'Saving…' : 'Save'}
        </button>
    </div>

    {#if error}<p class="px-4 pt-4 text-sm text-red-700 sm:px-6">{error}</p>{/if}
    <div class="flex flex-1 p-4 sm:p-6">
        {#if original === null && !error}
            <div class="flex flex-1 justify-center py-14"><Spinner /></div>
        {:else}
            <textarea bind:value={text} aria-label="Contents of {file.name}" spellcheck="false"
                class="block min-h-0 w-full flex-1 resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-4 font-mono text-[15px] leading-relaxed text-gray-900 focus:border-primary-500 focus:ring-primary-500 sm:h-[420px] sm:flex-none sm:resize-y sm:px-5"></textarea>
        {/if}
    </div>
</div>
