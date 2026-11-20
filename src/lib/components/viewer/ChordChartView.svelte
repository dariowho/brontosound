<script lang="ts">
    import { chartKey, type ChartLine, type ChordChart } from '$lib/chords/chordChart';
    import { isInRange, type ChartTimeline } from '$lib/chords/chartTimeline';
    import { chordTransposer, transposeKey } from '$lib/chords/chordSymbols';
    import ChordGrid from './ChordGrid.svelte';
    import ChordLyricsLine from './ChordLyricsLine.svelte';

    /**
     * A ChordPro, OnSong or chords-over-lyrics chart, laid out as ChordPro prints it:
     * chords over lyrics, choruses set apart, grids as bars, tabs in monospace.
     */
    let { chart, timeline, transpose, activeBar }: {
        chart: ChordChart,
        timeline: ChartTimeline,
        transpose: number, // semitones
        activeBar: number | null, // the bar the player is on, when the chart drives it
    } = $props();

    let key = $derived(chartKey(chart));
    let transposeChord = $derived(chordTransposer(key, transpose));
    let metaLine = $derived([
        ...chart.meta.subtitles,
        chart.meta.key && `Key ${transposeKey(chart.meta.key, transpose)}`,
        chart.meta.capo && `Capo ${chart.meta.capo}`,
        chart.meta.tempo && `${chart.meta.tempo} bpm`,
        chart.meta.time,
    ].filter(Boolean).join(' · '));

    const isActive = (item: object) => activeBar !== null && isInRange(activeBar, timeline.barsOf.get(item));
    const COMMENT_STYLES: Record<string, string> = {
        normal: 'bg-gray-100 text-gray-700',
        italic: 'text-gray-600',
        box: 'border border-gray-400 text-gray-700',
    };
</script>

{#snippet chartLine(line: ChartLine)}
    {#if line.kind == 'lyrics'}
        <ChordLyricsLine segments={line.segments} transpose={transposeChord} active={isActive(line)} />
    {:else if line.kind == 'comment'}
        <p class="my-1 w-fit rounded px-2 py-0.5 text-sm {COMMENT_STYLES[line.style]}">{line.text}</p>
    {:else if line.kind == 'tab'}
        <pre class="font-mono text-[15px] leading-snug text-gray-900">{line.text}</pre>
    {:else if line.kind == 'grid'}
        <ChordGrid row={line.row} transpose={transposeChord} isActive={isActive} />
    {:else}
        <div class="h-4"></div>
    {/if}
{/snippet}

<div class="flex flex-col gap-7 px-10 pb-10 pt-7">
    {#if chart.meta.title || metaLine}
        <div>
            {#if chart.meta.title}<div class="text-[22px] font-bold leading-tight text-gray-900">{chart.meta.title}</div>{/if}
            {#if metaLine}<div class="mt-1 text-sm text-gray-500">{metaLine}</div>{/if}
        </div>
    {/if}

    {#each chart.sections as section}
        {#if section.recalled}
            <!-- ChordPro prints a chorus recall as a comment -->
            <p class="w-fit rounded px-2 py-0.5 text-sm {isActive(section) ? 'bg-primary-200 text-gray-900' : 'bg-gray-100 text-gray-700'}">{section.label ?? 'Chorus'}</p>
        {:else}
            <div class="flex flex-col gap-1">
                {#if section.label}<div class="mb-1 text-sm font-medium text-gray-500">{section.label}</div>{/if}
                <div class="flex flex-col gap-1 {section.type == 'chorus' ? 'border-l-2 border-gray-300 pl-4' : ''}">
                    {#each section.lines as line}{@render chartLine(line)}{/each}
                </div>
            </div>
        {/if}
    {/each}
</div>
