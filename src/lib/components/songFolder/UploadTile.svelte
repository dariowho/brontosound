<script lang="ts">
    import { fileAtPath } from '$lib/songFiles/songFile';
    import type { Upload } from '$lib/songFiles/upload';
    import FileIcon from './FileIcon.svelte';

    /** A file being uploaded, in the folder grid: its progress, or why it failed */
    let { upload, onDismiss }: { upload: Upload, onDismiss: () => void } = $props();

    let percent = $derived(Math.round((upload.progress ?? 0) * 100));
</script>

<div class="flex min-h-[112px] flex-col items-center gap-2 px-1.5 pb-2.5 pt-3.5 text-gray-900">
    <FileIcon file={fileAtPath(upload.file.name)} />
    <span class="max-w-full text-center text-[13px] leading-tight [overflow-wrap:anywhere]">{upload.file.name}</span>
    {#if upload.error}
        <span class="text-center text-xs text-red-700">{upload.error}</span>
        <button type="button" class="text-xs font-medium text-primary-800 hover:text-primary-900" onclick={onDismiss}>Dismiss</button>
    {:else}
        <span role="progressbar" aria-label="Uploading {upload.file.name}" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
            class="block h-1 w-24 overflow-hidden rounded-full bg-gray-200">
            <span class="block h-full bg-primary-700 transition-[width]" style="width: {percent}%"></span>
        </span>
        <span class="text-xs text-gray-500">{upload.progress === null ? 'Waiting' : `${percent}%`}</span>
    {/if}
</div>
