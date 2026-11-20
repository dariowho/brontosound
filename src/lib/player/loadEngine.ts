import type { ChartTimeline } from '$lib/chords/chartTimeline';
import { fileKind } from '$lib/songFiles/fileTypes';
import { songFileUrl, type SongFile } from '$lib/songFiles/songFile';
import type { AudioFileEngine } from './audioFileEngine';
import { MetronomeEngine } from './metronomeEngine';
import type { MidiEngine, MidiTrack } from './midiEngine';

/** What the player plays: an audio or MIDI file, or the chart open in the viewer */
export type PlayerSource =
    | { kind: 'file', file: SongFile }
    | { kind: 'chart', file: SongFile, timeline: ChartTimeline, key?: string };

/** A source ready to play, with what its timeline shows */
export type LoadedEngine =
    | { kind: 'audio', engine: AudioFileEngine, peaks: number[] }
    | { kind: 'midi', engine: MidiEngine, lanes: TrackLane[] }
    | { kind: 'chart', engine: MetronomeEngine, timeline: ChartTimeline };

/** Where a MIDI track has notes, as blocks positioned in % of the song */
export type TrackLane = { left: number, width: number }[];

const WAVEFORM_BARS = 160;

/** File engines load on demand: they need the browser's Web Audio, and they are big */
export async function loadEngine(songId: number, source: PlayerSource): Promise<LoadedEngine> {
    if (source.kind == 'chart') {
        return { kind: 'chart', engine: new MetronomeEngine(source.timeline), timeline: source.timeline };
    }
    const url = songFileUrl(songId, source.file);
    if (fileKind(source.file) == 'midi') {
        const { MidiEngine } = await import('./midiEngine');
        const engine = await MidiEngine.load(url);
        return { kind: 'midi', engine, lanes: engine.tracks.map(track => trackLane(track, engine.duration)) };
    }
    const { AudioFileEngine } = await import('./audioFileEngine');
    const engine = await AudioFileEngine.load(url);
    return { kind: 'audio', engine, peaks: engine.peaks(WAVEFORM_BARS) };
}

/** The song cut in `slices`: consecutive slices with notes make a block */
function trackLane(track: MidiTrack, duration: number, slices = 200): TrackLane {
    const hasNotes = new Array<boolean>(slices).fill(false);
    for (const note of track.notes) {
        const first = Math.floor(note.time / duration * slices);
        const last = Math.min(slices - 1, Math.floor((note.time + note.duration) / duration * slices));
        for (let slice = first; slice <= last; slice++) hasNotes[slice] = true;
    }
    const lane: TrackLane = [];
    hasNotes.forEach((on, slice) => {
        if (!on) return;
        const previous = lane.at(-1);
        if (previous && previous.left + previous.width >= slice * 100 / slices) previous.width += 100 / slices;
        else lane.push({ left: slice * 100 / slices, width: 100 / slices });
    });
    return lane;
}
