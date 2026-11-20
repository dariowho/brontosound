<script lang="ts">
    import type { BarLine } from '$lib/chords/chordChart';

    /** A bar line as in printed music: single, double, final, with repeat dots */
    let { barLine }: { barLine: BarLine } = $props();

    let strokes = $derived.by((): ('thin' | 'thick')[] => {
        if (barLine.repeatStart && barLine.repeatEnd) return ['thin', 'thin'];
        if (barLine.repeatStart) return ['thick', 'thin'];
        if (barLine.repeatEnd || barLine.style == 'end') return ['thin', 'thick'];
        if (barLine.style == 'double') return ['thin', 'thin'];
        return ['thin'];
    });
</script>

{#snippet repeatDots()}
    <span class="flex flex-col justify-center gap-1.5"><span class="dot"></span><span class="dot"></span></span>
{/snippet}

<span class="flex shrink-0 items-stretch self-stretch gap-[3px]" aria-hidden="true">
    {#if barLine.repeatEnd}{@render repeatDots()}{/if}
    {#each strokes as stroke}
        <span class={stroke == 'thick' ? 'w-1 bg-gray-800' : 'w-px bg-gray-500'}></span>
    {/each}
    {#if barLine.repeatStart}{@render repeatDots()}{/if}
</span>

<style>
    .dot {
        width: 4px;
        height: 4px;
        border-radius: 9999px;
        background: #1f2937; /* gray-800 */
    }
</style>
