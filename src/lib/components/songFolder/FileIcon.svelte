<script lang="ts">
    import { fileKind } from '$lib/songFiles/fileTypes';
    import type { SongFile } from '$lib/songFiles/songFile';

    /** A file's icon by what Brontosound does with it: accent for files it opens, grey for download only */
    let { file, width = 48, downloadOnly = false }: {
        file: SongFile,
        width?: number,
        downloadOnly?: boolean, // show the download icon whatever the file type
    } = $props();

    const ICONS = { chordpro: 'chords', onsong: 'chords', text: 'text', markdown: 'text', pdf: 'pdf', audio: 'audio', midi: 'midi', folder: 'folder', other: 'download' } as const;
    let icon = $derived(downloadOnly ? 'download' : ICONS[fileKind(file)]);
</script>

<svg width={width} height={width * 52 / 48} viewBox="0 0 48 52" aria-hidden="true">
    {#if icon == 'folder'}
        <path d="M3 13a3 3 0 0 1 3-3h12l4 4h20a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" class="fill-primary-100 stroke-primary-700" stroke-width="1.75" stroke-linejoin="round" />
        <path d="M3 20h42" class="stroke-primary-700" stroke-width="1.75" />
    {:else}
        <!-- a page with a folded corner -->
        <g class={icon == 'download' ? 'fill-gray-100 stroke-gray-400' : 'fill-primary-100 stroke-primary-700'} stroke-width="1.75" stroke-linejoin="round">
            <path d="M9 2h20l12 12v34a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <path d="M29 2v10a2 2 0 0 0 2 2h10" fill="none" />
        </g>
        {#if icon == 'chords'}
            <!-- a chord diagram -->
            <path d="M15 24h18" class="stroke-primary-700" stroke-width="2.6" stroke-linecap="round" />
            <path d="M15 24v18M21 24v18M27 24v18M33 24v18M15 30h18M15 36h18M15 42h18" fill="none" class="stroke-primary-700" stroke-width="1.3" />
            <g class="fill-primary-700"><circle cx="21" cy="33" r="2.4" /><circle cx="27" cy="39" r="2.4" /><circle cx="33" cy="33" r="2.4" /></g>
        {:else if icon == 'text'}
            <path d="M14 25h20M14 30.5h20M14 36h20M14 41.5h13" class="stroke-primary-700" stroke-width="2" stroke-linecap="round" />
        {:else if icon == 'pdf'}
            <rect x="14" y="22" width="20" height="9" rx="1.5" class="fill-primary-300 stroke-primary-700" stroke-width="1.4" />
            <path d="M14 36h20M14 41.5h14" class="stroke-primary-700" stroke-width="2" stroke-linecap="round" />
        {:else if icon == 'audio'}
            <!-- a waveform -->
            <g class="fill-primary-700">
                <rect x="13" y="29" width="2.6" height="8" rx="1.3" /><rect x="17.6" y="25" width="2.6" height="16" rx="1.3" />
                <rect x="22.2" y="22" width="2.6" height="22" rx="1.3" /><rect x="26.8" y="27" width="2.6" height="12" rx="1.3" />
                <rect x="31.4" y="30" width="2.6" height="6" rx="1.3" />
            </g>
        {:else if icon == 'midi'}
            <!-- piano keys -->
            <rect x="13" y="25" width="22" height="16" rx="1.5" fill="white" class="stroke-primary-700" stroke-width="1.6" />
            <path d="M18.5 25v16M24 25v16M29.5 25v16" class="stroke-primary-700" stroke-width="1.4" />
            <g class="fill-primary-700"><rect x="16.7" y="25" width="3.6" height="9" rx="0.6" /><rect x="22.2" y="25" width="3.6" height="9" rx="0.6" /><rect x="27.7" y="25" width="3.6" height="9" rx="0.6" /></g>
        {:else}
            <!-- a download arrow -->
            <path d="M24 23v14M18.5 31.5 24 37l5.5-5.5M16 42.5h16" fill="none" class="stroke-gray-500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        {/if}
    {/if}
</svg>
