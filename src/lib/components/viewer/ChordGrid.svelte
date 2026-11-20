<script lang="ts">
    import type { GridBar, GridRow } from '$lib/chords/chordChart';
    import BarLineMark from './BarLineMark.svelte';

    /** A row of a ChordPro grid: bars of beats, with text before and after */
    let { row, transpose, isActive }: {
        row: GridRow,
        transpose: (chord: string) => string,
        isActive: (bar: GridBar) => boolean,
    } = $props();

    /** A cell holds a chord, chords sharing the beat, "/" (play again) or "%" (repeat the bar) */
    const cellText = (cell: string) => cell.split(' ').map(transpose).join(' ');
    const isSign = (cell: string) => cell == '/' || cell.startsWith('%');
</script>

<div class="flex max-w-2xl items-stretch">
    {#if row.margin}<span class="w-24 shrink-0 self-center pr-3 text-sm font-medium text-gray-500">{row.margin}</span>{/if}
    {#each row.bars as bar, i}
        <BarLineMark barLine={row.barLines[i]} />
        <div class="relative flex min-w-[88px] flex-1 items-center gap-2 px-3 py-1.5 {isActive(bar) ? 'bg-primary-200' : ''}">
            {#if row.barLines[i].volta}
                <span class="absolute -top-2.5 left-0 right-0 border-l border-t border-gray-500 pl-1 text-[11px] leading-3 text-gray-700">{row.barLines[i].volta}.</span>
            {/if}
            {#each bar.cells as cell}
                <span class="min-w-[1ch] flex-1 whitespace-nowrap text-base font-bold {isSign(cell) ? 'text-gray-500' : 'text-primary-800'}">{isSign(cell) ? cell : cellText(cell)}</span>
            {/each}
        </div>
    {/each}
    <BarLineMark barLine={row.barLines[row.barLines.length - 1]} />
    {#if row.comment}<span class="self-center pl-3 text-sm text-gray-500">{row.comment}</span>{/if}
</div>
