/**
 * Maps song time to AudioContext time while playing at a rate,
 * so engines know where playback is and when to schedule sounds.
 */
export class MediaClock {
    private from = 0; // song time when playback started
    private startedAt = 0; // context time when it started, maybe in the future (count-in)
    private rate = 1;
    private running = false;

    constructor(private context: AudioContext) {}

    start(from: number, rate: number, delay = 0) {
        this.from = from;
        this.rate = rate;
        this.startedAt = this.context.currentTime + delay;
        this.running = true;
    }

    stop() {
        this.from = this.position();
        this.running = false;
    }

    setRate(rate: number) {
        if (this.running) {
            this.from = this.position();
            this.startedAt = Math.max(this.startedAt, this.context.currentTime);
        }
        this.rate = rate;
    }

    position(): number {
        return this.positionAt(this.context.currentTime);
    }

    positionAt(contextTime: number): number {
        if (!this.running) return this.from;
        return this.from + Math.max(0, contextTime - this.startedAt) * this.rate;
    }

    contextTimeOf(songTime: number): number {
        return this.startedAt + (songTime - this.from) / this.rate;
    }
}

const LOOKAHEAD = 0.12; // seconds of sound scheduled ahead of playback
const INTERVAL = 25; // ms between scheduling rounds

/** While playing, hands out consecutive windows of song time a little ahead of playback, to schedule sounds on time */
export class LookaheadScheduler {
    private timer: ReturnType<typeof setInterval> | undefined;
    private scheduledUntil = 0;

    constructor(private context: AudioContext, private clock: MediaClock, private schedule: (from: number, to: number) => void) {}

    start(from: number) {
        this.stop();
        this.scheduledUntil = from;
        this.tick();
        this.timer = setInterval(() => this.tick(), INTERVAL);
    }

    stop() {
        clearInterval(this.timer);
    }

    private tick() {
        const until = this.clock.positionAt(this.context.currentTime + LOOKAHEAD);
        if (until <= this.scheduledUntil) return;
        this.schedule(this.scheduledUntil, until);
        this.scheduledUntil = until;
    }
}
