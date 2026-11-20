<script lang="ts">
    import type { Snippet } from 'svelte';

    /** A button that stays on or off, like Loop, Pin or a MIDI track. On, it takes the accent tint. */
    let { on, onclick, title, dot = false, children }: {
        on: boolean,
        onclick: () => void,
        title?: string,
        dot?: boolean, // a coloured dot before the label, for lists of switches (tracks)
        children: Snippet,
    } = $props();
</script>

<button type="button" aria-pressed={on} {title} {onclick}
    class="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-primary-300
        {on ? 'border-primary-300 bg-primary-100 text-primary-900' : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}">
    {#if dot}<span class="h-2 w-2 rounded-full {on ? 'bg-primary-700' : 'bg-gray-300'}"></span>{/if}
    {@render children()}
</button>
