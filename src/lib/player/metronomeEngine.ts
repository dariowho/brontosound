import { secondsPerBar, type ChartTimeline } from '$lib/chords/chartTimeline';
import { audioContext, resumeAudio, type PlaybackEngine } from './engine';
import { LookaheadScheduler, MediaClock } from './mediaClock';

/**
 * A chord chart in the player: a metronome counting through the chart's bars.
 * Transposing is the viewer's business, so `setTranspose` does nothing here.
 */
export class MetronomeEngine implements PlaybackEngine {
    click = true; // audible beats; without, the chart still follows along
    countIn = true; // a bar of clicks before playback starts
    readonly duration: number;
    private context = audioContext();
    private clock = new MediaClock(this.context);
    private scheduler = new LookaheadScheduler(this.context, this.clock, (from, to) => this.schedule(from, to));
    private beat: number; // seconds per beat at the chart's tempo
    private rate = 1;
    private clicks = new Set<OscillatorNode>(); // scheduled, to silence them on pause

    constructor(private timeline: ChartTimeline) {
        this.duration = timeline.bars * secondsPerBar(timeline);
        this.beat = 60 / timeline.tempo;
    }

    position() {
        return Math.min(this.clock.position(), this.duration);
    }

    play(from: number) {
        resumeAudio();
        const countInBeats = this.countIn ? this.timeline.beatsPerBar : 0;
        const beat = this.beat / this.rate;
        const now = this.context.currentTime + 0.05;
        for (let i = 0; i < countInBeats; i++) this.playClick(now + i * beat, i == 0);
        this.clock.start(from, this.rate, 0.05 + countInBeats * beat);
        this.scheduler.start(from);
    }

    seek(to: number) {
        this.clock.start(to, this.rate);
        this.scheduler.start(to);
    }

    pause() {
        this.scheduler.stop();
        this.clock.stop();
        this.clicks.forEach(click => click.stop());
        this.clicks.clear();
    }

    setSpeed(rate: number) {
        this.rate = rate;
        this.clock.setRate(rate);
    }

    setTranspose() {}

    dispose() {
        this.pause();
    }

    /** Click on every beat between `from` and `to` (song time), accenting the first of each bar */
    private schedule(from: number, to: number) {
        if (!this.click) return;
        for (let beat = Math.ceil(from / this.beat - 1e-6); beat * this.beat < to; beat++) {
            this.playClick(this.clock.contextTimeOf(beat * this.beat), beat % this.timeline.beatsPerBar == 0);
        }
    }

    private playClick(time: number, accent: boolean) {
        const oscillator = new OscillatorNode(this.context, { frequency: accent ? 1600 : 1000 });
        const gain = new GainNode(this.context, { gain: 0 });
        gain.gain.setValueAtTime(accent ? 0.5 : 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        oscillator.connect(gain).connect(this.context.destination);
        this.clicks.add(oscillator);
        oscillator.onended = () => this.clicks.delete(oscillator);
        oscillator.start(time);
        oscillator.stop(time + 0.06);
    }
}
