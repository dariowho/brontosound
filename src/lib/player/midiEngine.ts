import { Midi } from '@tonejs/midi';
import { audioContext, fetchArrayBuffer, resumeAudio, type PlaybackEngine } from './engine';
import { LookaheadScheduler, MediaClock } from './mediaClock';
import { MidiSynth } from './midiSynth';

interface MidiNote {
    midi: number;
    time: number; // seconds
    duration: number;
    velocity: number;
}

/** A MIDI track, as the player shows it */
export interface MidiTrack {
    name: string;
    notes: MidiNote[]; // sorted by time
    percussion: boolean;
    program: number; // General MIDI instrument
    enabled: boolean;
}

/** A MIDI file, played by the built-in synth. Tracks can be switched off, notes transposed. */
export class MidiEngine implements PlaybackEngine {
    readonly tracks: MidiTrack[];
    readonly duration: number;
    readonly tempo: number; // the file's first tempo, bpm
    private context = audioContext();
    private clock = new MediaClock(this.context);
    private scheduler = new LookaheadScheduler(this.context, this.clock, (from, to) => this.schedule(from, to));
    private synth = new MidiSynth(this.context);
    private outputs: GainNode[]; // one per track, to mute it at once
    private rate = 1;
    private semitones = 0;

    static async load(url: string): Promise<MidiEngine> {
        return new MidiEngine(new Midi(await fetchArrayBuffer(url)));
    }

    private constructor(midi: Midi) {
        this.duration = midi.duration;
        this.tempo = Math.round(midi.header.tempos[0]?.bpm ?? 120);
        this.tracks = midi.tracks
            .filter(track => track.notes.length > 0)
            .map((track, i) => ({
                name: track.name.trim() || track.instrument.name || `Track ${i + 1}`,
                notes: [...track.notes].sort((a, b) => a.time - b.time),
                percussion: track.instrument.percussion,
                program: track.instrument.number,
                enabled: true,
            }));
        this.outputs = this.tracks.map(() => new GainNode(this.context));
        this.outputs.forEach(output => output.connect(this.context.destination));
    }

    position() {
        return Math.min(this.clock.position(), this.duration);
    }

    play(from: number) {
        resumeAudio();
        this.synth.stopAll();
        this.clock.start(from, this.rate);
        this.scheduler.start(from);
    }

    seek(to: number) {
        this.play(to);
    }

    pause() {
        this.scheduler.stop();
        this.clock.stop();
        this.synth.stopAll();
    }

    setSpeed(rate: number) {
        this.rate = rate;
        this.clock.setRate(rate);
    }

    setTranspose(semitones: number) {
        this.semitones = semitones;
    }

    setTrackEnabled(index: number, enabled: boolean) {
        this.tracks[index].enabled = enabled;
        this.outputs[index].gain.value = enabled ? 1 : 0;
    }

    dispose() {
        this.pause();
        this.outputs.forEach(output => output.disconnect());
    }

    /** Play the notes starting between `from` and `to` (song time) */
    private schedule(from: number, to: number) {
        this.tracks.forEach((track, i) => {
            for (const note of notesStartingBetween(track.notes, from, to)) {
                const synthNote = {
                    midi: track.percussion ? note.midi : note.midi + this.semitones,
                    velocity: note.velocity,
                    start: this.clock.contextTimeOf(note.time),
                    duration: note.duration / this.rate,
                };
                if (track.percussion) this.synth.playDrum(this.outputs[i], synthNote);
                else this.synth.playNote(this.outputs[i], track.program, synthNote);
            }
        });
    }
}

/** Notes sorted by time, starting in [from, to) */
function notesStartingBetween(notes: MidiNote[], from: number, to: number): MidiNote[] {
    let low = 0, high = notes.length;
    while (low < high) { // first note at or after `from`
        const middle = (low + high) >> 1;
        if (notes[middle].time < from) low = middle + 1;
        else high = middle;
    }
    const result: MidiNote[] = [];
    for (let i = low; i < notes.length && notes[i].time < to; i++) result.push(notes[i]);
    return result;
}
