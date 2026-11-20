<script lang="ts">
    import { faChevronLeft, faChevronRight, faDownload } from '@fortawesome/free-solid-svg-icons';
    import { Spinner } from 'flowbite-svelte';
    import Fa from 'svelte-fa';
    import { chartKey } from '$lib/chords/chordChart';
    import { keyLabel } from '$lib/chords/chordSymbols';
    import { fileTypeLabel } from '$lib/songFiles/fileTypes';
    import type { SongDocument } from '$lib/songFiles/songDocument';
    import { songFileUrl, type SongFile } from '$lib/songFiles/songFile';
    import PinButton from '../controls/PinButton.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import ChordChartView from './ChordChartView.svelte';
    import DownloadPanel from './DownloadPanel.svelte';
    import IRealChartView from './IRealChartView.svelte';
    import MarkdownView from './MarkdownView.svelte';
    import PdfView from './PdfView.svelte';
    import TextView from './TextView.svelte';

    /** The file selected in the folder, shown in full: charts, documents, or a download panel */
    let { songId, file, document, error, pinned, onTogglePin, transpose = $bindable(), activeBar }: {
        songId: number,
        file: SongFile | null,
        document: SongDocument | null, // `file`, once loaded
        error: string | null,
        pinned: boolean,
        onTogglePin: () => void,
        transpose: number, // semitones, for charts
        activeBar: number | null, // the bar the player is on, when a chart drives it
    } = $props();

    let pdfPage = $state(1);
    let pdfPages = $state(0);

    let key = $derived(document?.kind == 'chart' ? chartKey(document.chart) : document?.kind == 'iReal' ? document.song.key : undefined);
    let isChart = $derived(document?.kind == 'chart' || document?.kind == 'iReal');
    const transposeBy = (semitones: number) => transpose = Math.min(11, Math.max(-11, transpose + semitones));

    const outlineButton = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-300';
</script>

<section aria-label="Viewer" class="overflow-hidden rounded-lg border border-gray-200">
    {#if file}
        <div class="flex min-h-[60px] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-gray-200 py-2 pl-5 pr-4">
            <div class="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span class="font-medium text-gray-900">{file.name}</span>
                <span class="text-[13px] text-gray-500">{document?.typeLabel ?? fileTypeLabel(file)}</span>
            </div>
            {#if document && document.kind != 'download'}
                <div class="flex flex-wrap items-center gap-2">
                    {#if isChart}
                        <div class="mr-3">
                            <Stepper label="Key" value={keyLabel(key, transpose)} decreaseLabel="Transpose down a semitone" increaseLabel="Transpose up a semitone"
                                onDecrease={() => transposeBy(-1)} onIncrease={() => transposeBy(1)} />
                        </div>
                    {:else if document.kind == 'pdf' && pdfPages > 1}
                        <div role="group" aria-label="Pages" class="mr-3 flex items-center gap-1.5">
                            <button type="button" class="{outlineButton} w-9 px-0" aria-label="Previous page" disabled={pdfPage == 1} onclick={() => pdfPage--}><Fa icon={faChevronLeft} size="xs" /></button>
                            <span class="min-w-[96px] text-center text-sm text-gray-700">Page {pdfPage} of {pdfPages}</span>
                            <button type="button" class="{outlineButton} w-9 px-0" aria-label="Next page" disabled={pdfPage == pdfPages} onclick={() => pdfPage++}><Fa icon={faChevronRight} size="xs" /></button>
                        </div>
                    {/if}
                    <a href={songFileUrl(songId, file, true)} class={outlineButton}><Fa icon={faDownload} size="xs" />Download</a>
                    <PinButton {pinned} onToggle={onTogglePin} />
                </div>
            {/if}
        </div>

        {#if error}
            <p class="px-10 py-8 text-sm text-gray-600">{error}</p>
        {:else if !document}
            <div class="flex justify-center py-14"><Spinner /></div>
        {:else if document.kind == 'chart'}
            <ChordChartView chart={document.chart} timeline={document.timeline} {transpose} {activeBar} />
        {:else if document.kind == 'iReal'}
            <IRealChartView song={document.song} timeline={document.timeline} {transpose} {activeBar} />
        {:else if document.kind == 'markdown'}
            <MarkdownView text={document.text} />
        {:else if document.kind == 'text'}
            <TextView text={document.text} />
        {:else if document.kind == 'pdf'}
            <PdfView url={document.url} bind:page={pdfPage} bind:pageCount={pdfPages} />
        {:else}
            <DownloadPanel {file} downloadUrl={songFileUrl(songId, file, true)} />
        {/if}
    {:else}
        <div class="flex flex-col items-center gap-2 px-6 pb-16 pt-14 text-center">
            <div class="text-xl font-bold text-gray-900">No document open</div>
            <p class="text-sm text-gray-600">Select a document in the folder above to open it here.</p>
        </div>
    {/if}
</section>
