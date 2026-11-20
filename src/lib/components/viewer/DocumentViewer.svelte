<script lang="ts">
    import { faChevronLeft, faChevronRight, faDownload, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
    import { Spinner } from 'flowbite-svelte';
    import Fa from 'svelte-fa';
    import { chartKey } from '$lib/chords/chordChart';
    import { keyLabel } from '$lib/chords/chordSymbols';
    import { fileTypeLabel, isEditableText } from '$lib/songFiles/fileTypes';
    import type { SongDocument } from '$lib/songFiles/songDocument';
    import { songFileUrl, type SongFile } from '$lib/songFiles/songFile';
    import DeleteConfirmRow from '../controls/DeleteConfirmRow.svelte';
    import PinButton from '../controls/PinButton.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import ChordChartView from './ChordChartView.svelte';
    import DownloadPanel from './DownloadPanel.svelte';
    import IRealChartView from './IRealChartView.svelte';
    import MarkdownView from './MarkdownView.svelte';
    import PdfView from './PdfView.svelte';
    import TextEditor from './TextEditor.svelte';
    import TextView from './TextView.svelte';

    /** The file selected in the folder, shown in full: charts, documents, or a download panel. Text files can be edited. */
    let { songId, file, document, error, pinned, onTogglePin, transpose = $bindable(), activeBar,
        editing = $bindable(), unsavedText = $bindable(), onSaveText, onCloseEditor, onDelete }: {
        songId: number,
        file: SongFile | null,
        document: SongDocument | null, // `file`, once loaded
        error: string | null,
        pinned: boolean,
        onTogglePin: () => void,
        transpose: number, // semitones, for charts
        activeBar: number | null, // the bar the player is on, when a chart drives it
        editing: boolean, // `file` is open in the text editor
        unsavedText: boolean,
        onSaveText: (text: string) => Promise<void>,
        onCloseEditor: () => void,
        onDelete: () => Promise<void>,
    } = $props();

    let confirmingDelete = $state<string | null>(null); // the path of the file asked about

    let pdfPage = $state(1);
    let pdfPages = $state(0);

    let key = $derived(document?.kind == 'chart' ? chartKey(document.chart) : document?.kind == 'iReal' ? document.song.key : undefined);
    let isChart = $derived(document?.kind == 'chart' || document?.kind == 'iReal');
    const transposeBy = (semitones: number) => transpose = Math.min(11, Math.max(-11, transpose + semitones));

    const outlineButton = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-300';
    // File actions: icon over label in a row of equal buttons on phones, inline from `sm` up
    const actionLayout = 'h-16 flex-col justify-center gap-1.5 sm:h-9 sm:flex-row sm:gap-2';
    const actionButton = `${actionLayout} inline-flex items-center rounded-lg border px-3 text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-primary-300`;
</script>

<section aria-label="Viewer" class="overflow-hidden rounded-lg border border-gray-200">
    {#if file && editing}
        <TextEditor {songId} {file} bind:dirty={unsavedText} onSave={onSaveText} onCancel={onCloseEditor} />
    {:else if file}
        <div class="flex min-h-[60px] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-gray-200 py-3 pl-4 pr-4 sm:py-2 sm:pl-5">
            <div class="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span class="font-medium text-gray-900">{file.name}</span>
                <span class="text-[13px] text-gray-500">{document?.typeLabel ?? fileTypeLabel(file)}</span>
            </div>
            <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {#if isChart}
                    <div class="mr-3">
                        <Stepper label="Key" value={keyLabel(key, transpose)} decreaseLabel="Transpose down a semitone" increaseLabel="Transpose up a semitone"
                            onDecrease={() => transposeBy(-1)} onIncrease={() => transposeBy(1)} />
                    </div>
                {:else if document?.kind == 'pdf' && pdfPages > 1}
                    <div role="group" aria-label="Pages" class="mr-3 flex items-center gap-1.5">
                        <button type="button" class="{outlineButton} w-9 px-0" aria-label="Previous page" disabled={pdfPage == 1} onclick={() => pdfPage--}><Fa icon={faChevronLeft} size="xs" /></button>
                        <span class="min-w-[96px] text-center text-sm text-gray-700">Page {pdfPage} of {pdfPages}</span>
                        <button type="button" class="{outlineButton} w-9 px-0" aria-label="Next page" disabled={pdfPage == pdfPages} onclick={() => pdfPage++}><Fa icon={faChevronRight} size="xs" /></button>
                    </div>
                {/if}
                <div class="grid w-full auto-cols-fr grid-flow-col gap-2 sm:flex sm:w-auto">
                    {#if isEditableText(file) && document}
                        <button type="button" class="{actionButton} border-gray-300 bg-white text-gray-900 hover:bg-gray-50" onclick={() => editing = true}><Fa icon={faPencil} size="xs" />Edit</button>
                    {/if}
                    {#if document?.kind != 'download'}
                        <a href={songFileUrl(songId, file, true)} class="{actionButton} border-gray-300 bg-white text-gray-900 hover:bg-gray-50"><Fa icon={faDownload} size="xs" />Download</a>
                        <PinButton {pinned} onToggle={onTogglePin} class={actionLayout} />
                    {/if}
                    <button type="button" aria-expanded={confirmingDelete == file.path} onclick={() => confirmingDelete = file.path}
                        class="{actionButton} border-red-300 text-red-700 {confirmingDelete == file.path ? 'bg-red-50' : 'bg-white hover:bg-red-50'}">
                        <Fa icon={faTrashCan} size="xs" />Delete
                    </button>
                </div>
            </div>
        </div>
        {#if confirmingDelete == file.path}
            <DeleteConfirmRow name={file.name} onCancel={() => confirmingDelete = null} onConfirm={onDelete} />
        {/if}

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
