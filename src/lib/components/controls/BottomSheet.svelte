<script lang="ts">
    import type { Snippet } from 'svelte';
    import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

    /** A panel over the page from the bottom of a phone screen. The chevron, a swipe down, Escape or the backdrop close it. */
    let { label, onClose, children }: { label: string, onClose: () => void, children: Snippet } = $props();

    let swipeFrom: number | null = null;

    $effect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    });

    function swipeStart(event: PointerEvent & { currentTarget: HTMLElement }) {
        swipeFrom = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function swipeEnd(event: PointerEvent) {
        if (swipeFrom !== null && event.clientY - swipeFrom > 60) onClose();
        swipeFrom = null;
    }
</script>

<svelte:window onkeydown={event => event.key == 'Escape' && onClose()} />

<div class="fixed inset-0 z-40">
    <button type="button" class="absolute inset-0 cursor-default bg-gray-900/45" aria-label="Close {label.toLowerCase()}" tabindex="-1" onclick={onClose}></button>
    <section role="dialog" aria-label={label}
        class="absolute inset-x-0 bottom-0 top-10 flex flex-col overflow-y-auto rounded-t-xl bg-white px-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <button type="button" aria-label="Close {label.toLowerCase()}" class="flex h-10 w-16 shrink-0 touch-none items-center justify-center self-center text-gray-500"
            onclick={onClose} onpointerdown={swipeStart} onpointerup={swipeEnd} onpointercancel={() => swipeFrom = null}>
            <Fa icon={faChevronDown} />
        </button>
        {@render children()}
    </section>
</div>
