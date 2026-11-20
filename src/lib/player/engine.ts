/**
 * Something the player plays: an audio file, a MIDI file, or a chord chart's metronome.
 * Times are seconds into the song at its own tempo, whatever the playback speed.
 */
export interface PlaybackEngine {
    readonly duration: number;
    position(): number;
    play(from: number): void;
    /** Jump while playing, without a count-in */
    seek(to: number): void;
    pause(): void;
    setSpeed(rate: number): void; // 1 = the song's own tempo
    setTranspose(semitones: number): void;
    dispose(): void;
}

let context: AudioContext | null = null;

/** The page's AudioContext, created on first use */
export function audioContext(): AudioContext {
    context ??= new AudioContext();
    return context;
}

/** Browsers keep audio suspended until the user acts: engines call this when the user plays */
export function resumeAudio() {
    if (context?.state == 'suspended') context.resume();
}

export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Couldn't load the file: ${response.statusText}`);
    return response.arrayBuffer();
}
