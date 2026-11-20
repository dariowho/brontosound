import { fetchApi } from '$lib/db';
import { playableChart, openDocument, type SongDocument } from '$lib/songFiles/songDocument';
import { defaultFiles, slotOf } from '$lib/songFiles/fileTypes';
import { fileAtPath, type SongFile, type SongPins } from '$lib/songFiles/songFile';
import type { PlayerSource } from '$lib/player/loadEngine';
import { chartKey } from '$lib/chords/chordChart';

/**
 * The song page's state: the folder being browsed, the file in the viewer, the file in the player, and the pins.
 * Pinned files open with the page; with nothing pinned, the first document and the first audio file do.
 */
export class SongPageState {
    // Raw state: files and documents are replaced, never changed, and keep their identity (chart timelines are keyed by object)
    folderPath = $state('');
    files = $state.raw<SongFile[]>([]);
    folderError = $state<string | null>(null);
    viewerFile = $state.raw<SongFile | null>(null);
    document = $state.raw<SongDocument | null>(null); // the viewer file, once loaded
    documentError = $state<string | null>(null);
    playerFile = $state.raw<SongFile | null>(null);
    playChart = $state(false); // the chart in the viewer drives the player, rather than the player file
    transpose = $state(0); // the chart's key, in semitones
    pins = $state.raw<SongPins>({ pinnedDocument: null, pinnedAudio: null });
    syncing = $state(false);

    fileSource = $derived<PlayerSource | null>(this.playerFile && { kind: 'file', file: this.playerFile });
    chartSource = $derived(chartSourceOf(this.document)); // the chart in the viewer, when it has bars to play
    chartIsPlaying = $derived(!!this.chartSource && (this.playChart || !this.playerFile));

    constructor(private songId: number, rootFiles: SongFile[], folderError: string | null, pins: SongPins) {
        this.files = rootFiles;
        this.folderError = folderError;
        this.pins = pins;

        const known = (path: string) => rootFiles.find(file => file.path == path) ?? fileAtPath(path);
        const defaults = defaultFiles(rootFiles);
        const document = pins.pinnedDocument ? known(pins.pinnedDocument) : defaults.document;
        this.playerFile = pins.pinnedAudio ? known(pins.pinnedAudio) : defaults.audio ?? null;
        if (document) this.openInViewer(document);
    }

    /** Folders are browsed, playable files go to the player, the rest to the viewer */
    open(file: SongFile) {
        const slot = slotOf(file);
        if (slot == 'folder') {
            this.browse(file.path);
        } else if (slot == 'player') {
            this.playerFile = file;
            this.playChart = false;
        } else {
            this.openInViewer(file);
        }
    }

    /** Release the audio or MIDI file: the player keeps the chart in the viewer, if any, or closes */
    closePlayerFile() {
        this.playerFile = null;
        this.playChart = false;
    }

    async browse(folderPath: string) {
        this.folderPath = folderPath;
        try {
            this.files = await fetchApi(`/api/song/${this.songId}/folder?${new URLSearchParams({ path: folderPath })}`);
            this.folderError = null;
        } catch (e) {
            this.files = [];
            this.folderError = (e as Error).message;
        }
    }

    openInViewer(file: SongFile) {
        this.viewerFile = file;
        this.transpose = 0;
        this.playChart = false;
        return this.loadDocument(file);
    }

    isPinned(file: SongFile): boolean {
        return file.path == this.pins.pinnedDocument || file.path == this.pins.pinnedAudio;
    }

    /** Pin the file in the viewer or in the player, replacing the previous pin; or unpin it */
    async togglePin(pin: keyof SongPins) {
        const file = pin == 'pinnedDocument' ? this.viewerFile : this.playerFile;
        if (!file) return;
        const pins = { ...this.pins, [pin]: this.pins[pin] == file.path ? null : file.path };
        this.pins = await fetchApi(`/api/song/${this.songId}/pins`, { method: 'POST', body: JSON.stringify(pins) });
    }

    /** Read the folder and the open document again from storage */
    async sync() {
        this.syncing = true;
        await Promise.all([this.browse(this.folderPath), this.viewerFile && this.loadDocument(this.viewerFile)]);
        this.syncing = false;
    }

    private async loadDocument(file: SongFile) {
        this.document = null;
        this.documentError = null;
        try {
            const document = await openDocument(this.songId, file);
            if (this.viewerFile === file) this.document = document;
        } catch (e) {
            if (this.viewerFile === file) this.documentError = (e as Error).message;
        }
    }
}

function chartSourceOf(document: SongDocument | null): PlayerSource | null {
    const chart = playableChart(document);
    if (!chart) return null;
    const key = chart.kind == 'chart' ? chartKey(chart.chart) : chart.kind == 'iReal' ? chart.song.key : undefined;
    return { kind: 'chart', file: chart.file, timeline: chart.timeline, key };
}
