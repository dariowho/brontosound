<script lang="ts">
    import type { BarLine } from '$lib/chords/chordChart';
    import { isInRange, type ChartTimeline } from '$lib/chords/chartTimeline';
    import { chordTransposer, transposeKey } from '$lib/chords/chordSymbols';
    import { iRealRows, type IRealCell, type IRealSong } from '$lib/chords/iRealPro';
    import BarLineMark from './BarLineMark.svelte';
    import IRealChordSymbol from './IRealChordSymbol.svelte';
    import MusicSymbol from './MusicSymbol.svelte';

    /** An iReal Pro chart as iReal Pro draws it: rows of 16 cells, section letters, repeats, endings, codas */
    let { song, timeline, transpose, activeBar }: {
        song: IRealSong,
        timeline: ChartTimeline,
        transpose: number,
        activeBar: number | null,
    } = $props();

    let rows = $derived(iRealRows(song.cells));
    let transposeNote = $derived(chordTransposer(song.key, transpose));
    let metaLine = $derived([song.composer, song.style, song.key && `Key ${transposeKey(song.key, transpose)}`, song.bpm && `${song.bpm} bpm`].filter(Boolean).join(' · '));

    const BAR_STARTS: Record<string, BarLine> = { '|': { style: 'single' }, '[': { style: 'double' }, '{': { style: 'single', repeatStart: true } };
    const BAR_ENDS: Record<string, BarLine> = { '|': { style: 'single' }, ']': { style: 'double' }, '}': { style: 'single', repeatEnd: true }, Z: { style: 'end' } };
    const SYMBOL_TEXT = { repeatBar: '%', repeatTwoBars: '%%', slash: '/', noChord: 'N.C.' };

    const isActive = (cell: IRealCell) => activeBar !== null && isInRange(activeBar, timeline.barsOf.get(cell));
    /** A row ends with a bar line even when the chart doesn't write one */
    const barEndOf = (cell: IRealCell, isRowEnd: boolean) => cell.barEnd ?? (isRowEnd ? '|' : undefined);
</script>

<div class="flex flex-col gap-2 px-10 pb-10 pt-7">
    <div class="mb-2">
        <div class="text-[22px] font-bold leading-tight text-gray-900">{song.title}</div>
        {#if metaLine}<div class="mt-1 text-sm text-gray-500">{metaLine}</div>{/if}
    </div>

    {#each rows as row}
        <div class="grid grid-cols-[repeat(16,minmax(0,1fr))]" style="margin-top: {12 + row[0].spaceAbove * 10}px">
            {#each row as cell, i}
                {@const barEnd = barEndOf(cell, i == row.length - 1)}
                <div class="relative flex h-12 items-center gap-1.5 pr-1 {isActive(cell) ? 'bg-primary-200' : ''}">
                    {#if cell.barStart}<span class="flex self-stretch py-1"><BarLineMark barLine={BAR_STARTS[cell.barStart]} /></span>{/if}
                    {#if barEnd}<span class="absolute inset-y-1 right-0 flex"><BarLineMark barLine={BAR_ENDS[barEnd]} /></span>{/if}
                    {#if cell.section}<span class="absolute -left-1 -top-3 border border-gray-900 bg-white px-1 text-xs font-bold leading-4">{cell.section}</span>{/if}
                    {#if cell.ending}<span class="absolute -top-2 left-0 w-[400%] border-l border-t border-gray-500 pl-1 text-[11px] leading-3 text-gray-700">{cell.ending}.</span>{/if}
                    {#if cell.marks.length}<span class="absolute -top-3 right-0 flex">{#each cell.marks as mark}<MusicSymbol symbol={mark} />{/each}</span>{/if}
                    {#if cell.comment}<span class="absolute -top-3 left-4 whitespace-nowrap text-[11px] text-gray-600">{cell.comment}</span>{/if}
                    {#if cell.timeSignature}
                        <span class="flex flex-col text-center text-[11px] font-bold leading-[11px]">{#each cell.timeSignature.split('/') as part}<span>{part}</span>{/each}</span>
                    {/if}
                    {#if cell.chord}
                        <span class="relative">
                            {#if cell.chord.alternate}<span class="absolute -top-4 left-0"><IRealChordSymbol chord={cell.chord.alternate} transpose={transposeNote} small /></span>{/if}
                            {#if cell.chord.root}<IRealChordSymbol chord={cell.chord} transpose={transposeNote} small={cell.small} />{/if}
                        </span>
                    {:else if cell.symbol}
                        <span class="whitespace-nowrap text-lg font-bold text-gray-700">{SYMBOL_TEXT[cell.symbol]}</span>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
</div>
