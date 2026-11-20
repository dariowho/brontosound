/**
 * A small built-in synthesizer for MIDI playback: an oscillator per note, shaped by instrument family,
 * and noise-based drums for the percussion channel. Good enough to practise against, with nothing to download.
 */

export interface SynthNote {
    midi: number; // note number, between semitones for fine pitch
    velocity: number; // 0 to 1
    start: number; // AudioContext time
    duration: number; // seconds
}

/** What plays a MIDI file's notes: the built-in synth or a soundfont's samples */
export interface MidiInstruments {
    playNote(output: AudioNode, program: number, note: SynthNote): void;
    playDrum(output: AudioNode, note: SynthNote): void;
    stopAll(): void; // silence every note, played or scheduled
}

interface Timbre {
    wave: OscillatorType;
    attack: number; // seconds
    release: number;
    plucked: boolean; // fades out while held, like a piano or a guitar
    brightness: number; // low-pass cut-off, Hz
}

const PLUCKED: Timbre = { wave: 'triangle', attack: 0.005, release: 0.2, plucked: true, brightness: 4000 };
const BASS: Timbre = { wave: 'sawtooth', attack: 0.01, release: 0.1, plucked: true, brightness: 900 };
const SUSTAINED: Timbre = { wave: 'sawtooth', attack: 0.06, release: 0.25, plucked: false, brightness: 2500 };
const ORGAN: Timbre = { wave: 'square', attack: 0.01, release: 0.08, plucked: false, brightness: 2000 };

/** By General MIDI family (program / 8): pianos, chromatic percussion, organs, guitars, basses, strings… */
const FAMILY_TIMBRES: Timbre[] = [
    PLUCKED, PLUCKED, ORGAN, PLUCKED, BASS, SUSTAINED, SUSTAINED, SUSTAINED,
    ORGAN, ORGAN, SUSTAINED, SUSTAINED, SUSTAINED, PLUCKED, PLUCKED, SUSTAINED,
];

const VOLUME = 0.25; // per note, leaving headroom for chords

const frequencyOf = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class MidiSynth implements MidiInstruments {
    private voices = new Set<AudioScheduledSourceNode>();
    private noise: AudioBuffer;

    constructor(private context: AudioContext) {
        this.noise = whiteNoise(context);
    }

    playNote(output: AudioNode, program: number, note: SynthNote) {
        const timbre = FAMILY_TIMBRES[Math.floor(program / 8)] ?? SUSTAINED;
        const oscillator = new OscillatorNode(this.context, { type: timbre.wave, frequency: frequencyOf(note.midi) });
        const filter = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: timbre.brightness });
        const end = note.start + note.duration;
        const gain = envelope(this.context, note.start, end, note.velocity * VOLUME, timbre);
        oscillator.connect(filter).connect(gain).connect(output);
        this.start(oscillator, note.start, end + timbre.release);
    }

    playDrum(output: AudioNode, note: SynthNote) {
        const drum = drumOf(note.midi);
        const level = note.velocity * VOLUME * 1.5;
        const end = note.start + drum.length;
        const gain = new GainNode(this.context, { gain: 0 });
        gain.gain.setValueAtTime(level, note.start);
        gain.gain.exponentialRampToValueAtTime(0.001, end);
        gain.connect(output);

        if (drum.pitch) {
            const oscillator = new OscillatorNode(this.context, { frequency: drum.pitch });
            oscillator.frequency.exponentialRampToValueAtTime(drum.pitch / 3, end);
            oscillator.connect(gain);
            this.start(oscillator, note.start, end);
        } else {
            const noise = new AudioBufferSourceNode(this.context, { buffer: this.noise });
            const filter = new BiquadFilterNode(this.context, { type: drum.filter, frequency: drum.frequency });
            noise.connect(filter).connect(gain);
            this.start(noise, note.start, end);
        }
    }

    stopAll() {
        this.voices.forEach(voice => voice.stop());
        this.voices.clear();
    }

    private start(voice: AudioScheduledSourceNode, start: number, end: number) {
        this.voices.add(voice);
        voice.onended = () => this.voices.delete(voice);
        voice.start(start);
        voice.stop(end);
    }
}

function envelope(context: AudioContext, start: number, end: number, level: number, timbre: Timbre): GainNode {
    const gain = new GainNode(context, { gain: 0 });
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + timbre.attack);
    if (timbre.plucked) gain.gain.exponentialRampToValueAtTime(level * 0.3, Math.max(end, start + timbre.attack + 0.01));
    else gain.gain.setValueAtTime(level, end);
    gain.gain.linearRampToValueAtTime(0, end + timbre.release);
    return gain;
}

interface Drum {
    length: number; // seconds
    pitch?: number; // Hz, for drums with a pitch: kicks and toms
    filter?: BiquadFilterType;
    frequency?: number;
}

const KICK: Drum = { length: 0.3, pitch: 150 };
const TOM: Drum = { length: 0.3, pitch: 220 };
const SNARE: Drum = { length: 0.18, filter: 'bandpass', frequency: 1800 };
const HI_HAT: Drum = { length: 0.05, filter: 'highpass', frequency: 7000 };
const CYMBAL: Drum = { length: 0.8, filter: 'highpass', frequency: 5000 };

/** General MIDI percussion, by note number */
function drumOf(midi: number): Drum {
    if (midi == 35 || midi == 36) return KICK;
    if ([37, 38, 39, 40].includes(midi)) return SNARE;
    if ([41, 43, 45, 47, 48, 50].includes(midi)) return TOM;
    if ([42, 44, 46].includes(midi)) return HI_HAT;
    if ([49, 51, 52, 53, 55, 57, 59].includes(midi)) return CYMBAL;
    return HI_HAT;
}

function whiteNoise(context: AudioContext): AudioBuffer {
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    return buffer;
}
