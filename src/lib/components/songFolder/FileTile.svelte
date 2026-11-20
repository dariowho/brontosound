<script lang="ts">
    import { faPlay, faThumbtack } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import { fileHint, fileTypeLabel, isDownloadOnly } from '$lib/songFiles/fileTypes';
    import type { SongFile } from '$lib/songFiles/songFile';
    import FileIcon from './FileIcon.svelte';

    /**
     * A file in the folder grid. The tinted tile is the file in the viewer, the dark play badge
     * the file in the player, the accent badge a pinned file.
     */
    let { file, inViewer, inPlayer, pinned, onOpen }: {
        file: SongFile,
        inViewer: boolean,
        inPlayer: boolean,
        pinned: boolean,
        onOpen: () => void,
    } = $props();

    let hint = $derived(`${file.name} · ${fileTypeLabel(file)} · ${fileHint(file)}`);
    let state = $derived([pinned && 'Pinned', inViewer && 'In the viewer', inPlayer && 'In the player'].filter(Boolean));
</script>

<button type="button" onclick={onOpen} title={hint} aria-label={[hint, ...state].join(' · ')}
    class="flex min-h-[112px] flex-col items-center gap-2 rounded-lg px-1.5 pb-2.5 pt-3.5 focus:outline-none focus:ring-4 focus:ring-primary-300
        {inViewer ? 'bg-primary-200' : 'hover:bg-gray-50'} {isDownloadOnly(file) ? 'text-gray-500' : 'text-gray-900'}">
    <span class="relative block">
        <FileIcon {file} />
        {#if pinned}
            <span class="badge -right-2 -top-1.5 bg-primary-700"><Fa icon={faThumbtack} size="xs" /></span>
        {/if}
        {#if inPlayer}
            <span class="badge -bottom-1 -right-2 bg-charcoal"><Fa icon={faPlay} size="xs" /></span>
        {/if}
    </span>
    <span class="max-w-full text-center text-[13px] leading-tight [overflow-wrap:anywhere]">{file.name}</span>
</button>

<style>
    .badge {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border: 2px solid white;
        border-radius: 9999px;
        color: white;
        font-size: 10px;
    }
</style>
