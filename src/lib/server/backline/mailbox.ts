// How Brontosound and the Backline app pass each other messages (not mail between users).
// A queue that one side fills and the other empties over HTTP with long polls: its GET waits until there is
// something to fetch. Used both ways between Backline and the browsers on /backline (see docs/backline.md).

const HOLD_MS = 25_000;  // how long a pull waits for a message before returning none
const MAX_ITEMS = 500;   // a reader this far behind starts losing the oldest messages

export class Mailbox<T> {
    private items: { n: number, item: T }[] = [];
    private last = 0;
    private wake: (() => void) | null = null;
    /** When the reader last asked: tells whether it is still there */
    lastPull = Date.now();

    /** The number of the newest message */
    get next(): number {
        return this.last;
    }

    push(item: T): void {
        this.items.push({ n: ++this.last, item });
        if (this.items.length > MAX_ITEMS) {
            this.items.shift();
        }
        this.wake?.();
    }

    /**
     * The messages after number `after`: at once if there are any, else as soon as one arrives.
     * Messages are kept until a later pull confirms them with a higher `after`, so a lost response loses nothing.
     */
    async pull(after: number): Promise<{ next: number, items: T[] }> {
        this.lastPull = Date.now();
        this.wake?.(); // one reader at a time: a new pull releases the one still waiting
        this.items = this.items.filter(({ n }) => n > after);
        if (this.items.length === 0) {
            await new Promise<void>(resolve => {
                const done = () => {
                    clearTimeout(timer);
                    if (this.wake === done) {
                        this.wake = null;
                    }
                    resolve();
                };
                const timer = setTimeout(done, HOLD_MS);
                this.wake = done;
            });
            this.lastPull = Date.now();
        }
        return { next: this.last, items: this.items.map(({ item }) => item) };
    }

    /** Answers the waiting pull now */
    release(): void {
        this.wake?.();
    }
}
