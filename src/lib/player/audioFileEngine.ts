import { SoundTouchNode } from '@soundtouchjs/audio-worklet';
import processorUrl from '@soundtouchjs/audio-worklet/processor?url';
import { audioContext, fetchArrayBuffer, resumeAudio, type PlaybackEngine } from './engine';
import { MediaClock } from './mediaClock';

let registered: Promise<void> | null = null;

/**
 * An audio file, decoded in memory so playback starts instantly from any point.
 * Speed and pitch change independently through SoundTouch, which is bypassed at the original speed and pitch.
 */
export class AudioFileEngine implements PlaybackEngine {
    private context = audioContext();
    private clock = new MediaClock(this.context);
    private soundTouch = new SoundTouchNode({ context: this.context });
    private source: AudioBufferSourceNode | null = null;
    private rate = 1;
    private semitones = 0;

    static async load(url: string): Promise<AudioFileEngine> {
        const context = audioContext();
        registered ??= SoundTouchNode.register(context, processorUrl);
        const [data] = await Promise.all([fetchArrayBuffer(url), registered]);
        return new AudioFileEngine(await context.decodeAudioData(data));
    }

    private constructor(private buffer: AudioBuffer) {
        this.soundTouch.connect(this.context.destination);
    }

    get duration() {
        return this.buffer.duration;
    }

    position() {
        return Math.min(this.clock.position(), this.duration);
    }

    play(from: number) {
        resumeAudio();
        this.stopSource();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.playbackRate.value = this.rate;
        this.route();
        this.source.start(0, from);
        this.clock.start(from, this.rate);
    }

    seek(to: number) {
        this.play(to);
    }

    pause() {
        this.stopSource();
        this.clock.stop();
    }

    setSpeed(rate: number) {
        this.rate = rate;
        this.clock.setRate(rate);
        this.soundTouch.playbackRate.value = rate; // SoundTouch undoes the pitch change of the faster source
        if (this.source) this.source.playbackRate.value = rate;
        this.route();
    }

    setTranspose(semitones: number) {
        this.semitones = semitones;
        this.soundTouch.pitchSemitones.value = semitones;
        this.route();
    }

    /** The waveform's loudness in `count` slices, from 0 to 1 */
    peaks(count: number): number[] {
        const samples = this.buffer.getChannelData(0);
        const size = Math.floor(samples.length / count);
        const peaks = Array.from({ length: count }, (_, i) => {
            let peak = 0;
            for (let j = i * size; j < (i + 1) * size; j++) peak = Math.max(peak, Math.abs(samples[j]));
            return peak;
        });
        const loudest = Math.max(...peaks) || 1;
        return peaks.map(peak => peak / loudest);
    }

    dispose() {
        this.pause();
        this.soundTouch.disconnect();
    }

    private route() {
        if (!this.source) return;
        const needsSoundTouch = this.rate != 1 || this.semitones != 0;
        this.source.disconnect();
        this.source.connect(needsSoundTouch ? this.soundTouch : this.context.destination);
    }

    private stopSource() {
        this.source?.stop();
        this.source?.disconnect();
        this.source = null;
    }
}
