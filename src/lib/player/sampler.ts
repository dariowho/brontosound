import { GM_INSTRUMENTS, GM_PERCUSSION } from './gmInstruments';
import type { MidiInstruments, SynthNote } from './midiSynth';

/**
 * Sampled General MIDI instruments from a MIDI.js soundfont: `<url><instrument>-mp3.js` files,
 * each a note name → base64 MP3 map. Instruments that can't load play through `fallback`.
 */

type Samples = Map<number, AudioBuffer>; // by note number

const VOLUME = 0.5; // per note, for samples normalised to full scale: about as loud as the built-in synth
const RELEASE = 0.15; // seconds

const loaded = new Map<string, Promise<Samples>>(); // by file URL, for every player on the page

export class Sampler implements MidiInstruments {
    private voices = new Set<AudioScheduledSourceNode>();

    private constructor(
        private context: AudioContext,
        private programs: Map<number, Samples>,
        private drums: Samples | null,
        private fallback: MidiInstruments,
    ) {}

    /** Load the instruments a file uses; fails only if none load */
    static async load(context: AudioContext, url: string, programs: number[], percussion: boolean, fallback: MidiInstruments): Promise<Sampler> {
        const load = (name: string) => loadSamples(context, `${url}${name}-mp3.js`).catch(() => null);
        const [drums, ...instruments] = await Promise.all([percussion ? load(GM_PERCUSSION) : null, ...programs.map(p => load(GM_INSTRUMENTS[p]))]);
        const byProgram = new Map<number, Samples>();
        instruments.forEach((samples, i) => samples && byProgram.set(programs[i], samples));
        if (byProgram.size == 0 && !drums) throw new Error(`No instruments at ${url}`);
        return new Sampler(context, byProgram, drums, fallback);
    }

    playNote(output: AudioNode, program: number, note: SynthNote) {
        const samples = this.programs.get(program);
        if (!samples) return this.fallback.playNote(output, program, note);
        this.play(output, samples, note, note.start + note.duration);
    }

    playDrum(output: AudioNode, note: SynthNote) {
        if (!this.drums) return this.fallback.playDrum(output, note);
        this.play(output, this.drums, note, null); // drums ring out
    }

    stopAll() {
        this.voices.forEach(voice => voice.stop());
        this.voices.clear();
        this.fallback.stopAll();
    }

    /** The closest sample, re-pitched to the note (which can fall between semitones); held until `end`, or to its own end */
    private play(output: AudioNode, samples: Samples, note: SynthNote, end: number | null) {
        const sampled = closest(samples, Math.round(note.midi));
        if (sampled === undefined) return;
        const source = new AudioBufferSourceNode(this.context, {
            buffer: samples.get(sampled),
            playbackRate: Math.pow(2, (note.midi - sampled) / 12),
        });
        const level = note.velocity * VOLUME;
        const gain = new GainNode(this.context, { gain: level });
        source.connect(gain).connect(output);

        this.voices.add(source);
        source.onended = () => this.voices.delete(source);
        source.start(note.start);
        if (end !== null) {
            gain.gain.setValueAtTime(level, end);
            gain.gain.linearRampToValueAtTime(0, end + RELEASE);
            source.stop(end + RELEASE);
        }
    }
}

function closest(samples: Samples, midi: number): number | undefined {
    for (let distance = 0; distance < 128; distance++) {
        if (samples.has(midi - distance)) return midi - distance;
        if (samples.has(midi + distance)) return midi + distance;
    }
}

function loadSamples(context: AudioContext, url: string): Promise<Samples> {
    let samples = loaded.get(url);
    if (!samples) {
        samples = decodeSoundfontFile(context, url);
        samples.catch(() => loaded.delete(url)); // try again next time
        loaded.set(url, samples);
    }
    return samples;
}

/** A MIDI.js file: `MIDI.Soundfont.<name> = { "A0": "data:audio/mp3;base64,…", … }` */
async function decodeSoundfontFile(context: AudioContext, url: string): Promise<Samples> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.statusText}`);
    const notes = [...(await response.text()).matchAll(/"([A-G][b#]?-?\d)"\s*:\s*"data:[^;]*;base64,([^"]*)"/g)];
    const decoded = await Promise.all(notes.map(async ([, name, base64]) =>
        [noteNumber(name), await context.decodeAudioData(bytesOf(base64))] as const));
    normalise(decoded.map(([, buffer]) => buffer));
    return new Map(decoded);
}

/**
 * Scale an instrument's samples so its loudest peak is full scale, keeping the notes' relative levels.
 * Soundfonts are recorded well below it (FluidR3 peaks around -20 dBFS), and each at its own level.
 */
function normalise(buffers: AudioBuffer[]) {
    const channels = buffers.flatMap(buffer => Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i)));
    let peak = 0;
    for (const data of channels) for (const sample of data) peak = Math.max(peak, Math.abs(sample));
    if (peak == 0) return;
    for (const data of channels) for (let i = 0; i < data.length; i++) data[i] /= peak;
}

const PITCH_CLASSES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "Eb1" → 27; A0 is 21 */
function noteNumber(name: string): number {
    const accidental = name[1] == 'b' ? -1 : name[1] == '#' ? 1 : 0;
    const octave = parseInt(name.slice(accidental ? 2 : 1));
    return (octave + 1) * 12 + PITCH_CLASSES[name[0]] + accidental;
}

function bytesOf(base64: string): ArrayBuffer {
    const text = atob(base64);
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
    return bytes.buffer;
}
