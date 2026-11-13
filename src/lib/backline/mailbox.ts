// The browser's end of a Backline mailbox (src/lib/server/backline/mailbox.ts): fetches messages with long polls and posts ours.

export interface MailboxEvents {
    /** Seated, or seated again after being forgotten: the other side has nothing of ours */
    opened(): void;
    message(text: string): void;
    /** Not allowed in (any more), or nothing is live. The mailbox keeps asking */
    refused(): void;
}

export function openMailbox(url: string, on: MailboxEvents): { send(text: string): void, close(): void } {
    let id: string | null = null;
    let after = 0;
    let open = true;
    let outbox: string[] = [];
    let posting = false;

    async function pull() {
        let retryMs = 300;
        while (open) {
            try {
                const res = await fetch(id ? `${url}?id=${id}&after=${after}` : url, { cache: 'no-store', signal: AbortSignal.timeout(35_000) });
                if (res.status === 410) {
                    id = null;
                    continue;
                }
                if (res.status === 403) {
                    id = null;
                    on.refused();
                }
                if (!res.ok) {
                    throw new Error(res.statusText);
                }
                const body = await res.json();
                if (body.id) {
                    id = body.id;
                    outbox = [];
                    on.opened();
                }
                after = body.next;
                body.items.forEach(on.message);
                retryMs = 300;
            } catch {
                await new Promise(resolve => setTimeout(resolve, retryMs));
                retryMs = Math.min(retryMs * 2, 3000);
            }
        }
    }

    // One POST at a time keeps the order. What cannot be sent now is dropped, never sent late: these are taps on
    // a live show
    async function post() {
        if (posting) {
            return;
        }
        posting = true;
        while (open && id && outbox.length > 0) {
            await fetch(`${url}?id=${id}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ items: outbox.splice(0) }),
                signal: AbortSignal.timeout(3000),
            }).catch(() => {});
        }
        posting = false;
    }

    pull();
    return {
        send(text) {
            if (id) {
                outbox.push(text);
                post();
            }
        },
        close() {
            open = false;
        },
    };
}
