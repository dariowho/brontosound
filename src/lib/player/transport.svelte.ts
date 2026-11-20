import type { PlaybackEngine } from './engine';

/**
 * The practice controls over whatever the player plays (docs/songPage.md):
 * play and pause, a start point that every play starts from, and a loop from the start point.
 */
export class Transport {
    playing = $state(false);
    position = $state(0);
    duration = $state(0);
    startPoint = $state<number | null>(null);
    loop = $state(false);
    loopEnd = $state<number | null>(null); // null: the end of the song

    private engine: PlaybackEngine | null = null;
    private frame = 0;

    /** Play this engine from now on, from the top, with no start point */
    attach(engine: PlaybackEngine | null) {
        this.pause();
        this.engine = engine;
        this.duration = engine?.duration ?? 0;
        this.position = 0;
        this.startPoint = null;
        this.loopEnd = null;
        this.loop = false;
    }

    get loopRange(): [number, number] {
        return [this.startPoint ?? 0, this.loopEnd ?? this.duration];
    }

    togglePlay() {
        if (this.playing) this.pause();
        else this.play();
    }

    play() {
        if (!this.engine) return;
        const from = this.startPoint ?? (this.position >= this.duration ? 0 : this.position);
        this.engine.play(from);
        this.position = from;
        this.playing = true;
        this.frame = requestAnimationFrame(this.follow);
    }

    pause() {
        this.engine?.pause();
        this.playing = false;
        cancelAnimationFrame(this.frame);
    }

    seekTo(time: number) {
        this.position = Math.min(Math.max(time, 0), this.duration);
        if (this.playing) this.engine?.seek(this.position);
    }

    seekBy(seconds: number) {
        this.seekTo(this.position + seconds);
    }

    goToStart() {
        this.seekTo(this.startPoint ?? 0);
    }

    setStartPoint(time: number) {
        this.startPoint = time;
        this.loopEnd = null;
        this.seekTo(time);
    }

    /** Loop between two points: the first becomes the start point */
    setLoop(from: number, to: number) {
        this.startPoint = from;
        this.loopEnd = to;
        this.loop = true;
        this.seekTo(from);
    }

    clearStartPoint() {
        this.startPoint = null;
        this.loopEnd = null;
    }

    /** Track the engine's position every frame, looping and stopping at the end */
    private follow = () => {
        if (!this.engine || !this.playing) return;
        this.position = this.engine.position();
        const [loopStart, loopEnd] = this.loopRange;
        if (this.loop && this.position >= loopEnd) {
            this.seekTo(loopStart);
        } else if (this.position >= this.duration) {
            this.pause();
            this.position = this.startPoint ?? 0;
            return;
        }
        this.frame = requestAnimationFrame(this.follow);
    };
}
