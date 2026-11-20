import { secondsPerBar } from '$lib/chords/chartTimeline';
import type { TimelineView } from '$lib/components/player/Timeline.svelte';
import { loadEngine, type LoadedEngine, type PlayerSource } from './loadEngine';
import { Transport } from './transport.svelte';

/**
 * What the player plays and how (docs/songPage.md): the source's engine once loaded, the transport,
 * and the practice settings, back to the file's own for every file. Create it while a component initialises.
 */
export class PlayerState {
    readonly transport = new Transport();
    loaded = $state.raw<LoadedEngine | null>(null);
    loadError = $state<string | null>(null);

    speed = $state(100); // %, audio files
    tempo = $state(120); // bpm, MIDI files and charts
    semitones = $state(0); // transpose, audio and MIDI files
    cents = $state(0); // fine pitch, on top of `semitones`
    tracksOn = $state<boolean[]>([]); // MIDI files
    click = $state(true); // charts
    countIn = $state(true);

    isChart = $derived(this.loaded?.kind == 'chart');
    usesTempo = $derived(this.loaded?.kind == 'midi' || this.loaded?.kind == 'chart');
    barSeconds = $derived(this.loaded?.kind == 'chart' ? secondsPerBar(this.loaded.timeline) : 0);

    view = $derived.by((): TimelineView | null => {
        const loaded = this.loaded;
        if (loaded?.kind == 'audio') return { kind: 'waveform', peaks: loaded.peaks };
        if (loaded?.kind == 'midi') return { kind: 'tracks', lanes: loaded.lanes.map((blocks, i) => ({ blocks, enabled: this.tracksOn[i] })) };
        if (loaded?.kind == 'chart') return { kind: 'sections', timeline: loaded.timeline };
        return null;
    });

    constructor(songId: number, source: () => PlayerSource | null) {
        $effect(() => {
            const current = source();
            if (!current) return;
            let cancelled = false;
            this.loaded = null;
            this.loadError = null;
            loadEngine(songId, current).then(engine => {
                if (cancelled) return engine.engine.dispose();
                this.resetSettings(engine);
                this.transport.attach(engine.engine);
                this.loaded = engine;
            }, e => this.loadError = (e as Error).message);
            return () => {
                cancelled = true;
                this.transport.attach(null);
                this.loaded?.engine.dispose();
            };
        });

        $effect(() => {
            const loaded = this.loaded;
            if (!loaded) return;
            loaded.engine.setSpeed(this.usesTempo ? this.tempo / baseTempo(loaded) : this.speed / 100);
        });
        $effect(() => this.loaded?.engine.setTranspose(this.semitones + this.cents / 100));
        $effect(() => {
            const metronome = this.loaded?.kind == 'chart' ? this.loaded.engine : null;
            if (!metronome) return;
            metronome.click = this.click;
            metronome.countIn = this.countIn;
        });
        $effect(() => {
            const midi = this.loaded?.kind == 'midi' ? this.loaded.engine : null;
            this.tracksOn.forEach((on, i) => midi?.setTrackEnabled(i, on));
        });
    }

    /** Arrows move 5 s, or a bar on a chart */
    get step(): number {
        return this.isChart ? this.barSeconds : 5;
    }

    barOf(seconds: number): number {
        return Math.floor(seconds / this.barSeconds) + 1;
    }

    /** A time as the player shows it: bars on a chart */
    label(seconds: number): string {
        return this.isChart ? `bar ${this.barOf(seconds)}` : formatTime(seconds);
    }

    /** Charts start on a bar; files on the tenth of a second */
    snap = (time: number): number => this.isChart ? Math.floor(time / this.barSeconds) * this.barSeconds : Math.round(time * 10) / 10;

    private resetSettings(engine: LoadedEngine) {
        this.speed = 100;
        this.semitones = 0;
        this.cents = 0;
        this.tempo = baseTempo(engine);
        this.tracksOn = engine.kind == 'midi' ? engine.engine.tracks.map(() => true) : [];
    }
}

const baseTempo = (engine: LoadedEngine) => engine.kind == 'midi' ? engine.engine.tempo : engine.kind == 'chart' ? engine.timeline.tempo : 120;

export const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
