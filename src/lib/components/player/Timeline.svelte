<script lang="ts" module>
    import type { ChartTimeline } from '$lib/chords/chartTimeline';
    import type { TrackLane } from '$lib/player/loadEngine';

    /** What the timeline draws: an audio file's waveform, a MIDI file's tracks, a chart's sections */
    export type TimelineView =
        | { kind: 'waveform', peaks: number[] }
        | { kind: 'tracks', lanes: { blocks: TrackLane, enabled: boolean }[] }
        | { kind: 'sections', timeline: ChartTimeline };
</script>

<script lang="ts">
    import { isInRange, secondsPerBar } from '$lib/chords/chartTimeline';

    /** The song from start to end: click to set the start point, drag to loop a part */
    let { view, duration, position, startPoint, startLabel, loopRange, snap, onSetStart, onSetLoop }: {
        view: TimelineView,
        duration: number,
        position: number,
        startPoint: number | null,
        startLabel: string,
        loopRange: [number, number] | null, // shown when looping
        snap: (time: number) => number, // charts snap to bars
        onSetStart: (time: number) => void,
        onSetLoop: (from: number, to: number) => void,
    } = $props();

    let element: HTMLButtonElement;
    let drag = $state<{ x: number, from: number, to: number | null } | null>(null);

    const percent = (time: number) => duration ? Math.min(100, Math.max(0, time / duration * 100)) : 0;
    let playedPercent = $derived(percent(position));
    let activeBar = $derived(view.kind == 'sections' ? Math.floor(position / secondsPerBar(view.timeline)) : -1);

    function timeAt(event: PointerEvent): number {
        const rect = element.getBoundingClientRect();
        return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration;
    }

    function startDrag(event: PointerEvent) {
        element.setPointerCapture(event.pointerId);
        drag = { x: event.clientX, from: timeAt(event), to: null };
    }

    function moveDrag(event: PointerEvent) {
        if (drag && Math.abs(event.clientX - drag.x) > 4) drag.to = timeAt(event);
    }

    function endDrag() {
        if (!drag) return;
        if (drag.to === null) onSetStart(snap(drag.from));
        else onSetLoop(snap(Math.min(drag.from, drag.to)), snap(Math.max(drag.from, drag.to)));
        drag = null;
    }

    /** With the keyboard, the start point goes where the playhead is */
    function setStartFromKeyboard(event: MouseEvent) {
        if (event.detail == 0) onSetStart(snap(position));
    }

    let shownRange = $derived(drag?.to != null ? [Math.min(drag.from, drag.to), Math.max(drag.from, drag.to)] : loopRange);
</script>

{#snippet waveform(peaks: number[], color: string)}
    {#each peaks as peak}<span class="flex-1 rounded-[1px] {color}" style="height: {Math.max(10, peak * 100)}%"></span>{/each}
{/snippet}

<button type="button" bind:this={element} aria-label="Set the start point" title="Click to set where every play starts, drag to loop a part"
    class="relative block h-[60px] min-w-0 flex-[1_1_360px] touch-none text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
    onpointerdown={startDrag} onpointermove={moveDrag} onpointerup={endDrag} onpointercancel={() => drag = null} onclick={setStartFromKeyboard}>

    {#if shownRange}
        <span class="absolute bottom-0 top-5 border-x border-primary-400 bg-primary-50"
            style="left: {percent(shownRange[0])}%; width: {percent(shownRange[1]) - percent(shownRange[0])}%"></span>
    {/if}

    <span class="absolute inset-x-0 bottom-0 top-5 block">
        {#if view.kind == 'waveform'}
            <!-- grey, and orange up to the playhead -->
            <span class="absolute inset-0 flex items-center gap-0.5">{@render waveform(view.peaks, 'bg-gray-300')}</span>
            <span class="absolute inset-0 flex items-center gap-0.5" style="clip-path: inset(0 {100 - playedPercent}% 0 0)">{@render waveform(view.peaks, 'bg-primary-700')}</span>
        {:else if view.kind == 'tracks'}
            <span class="flex h-full flex-col justify-center gap-0.5">
                {#each view.lanes as lane}
                    <span class="relative block h-2">
                        {#each lane.blocks as block}
                            <span class="absolute inset-y-0 rounded-sm {lane.enabled ? 'bg-primary-700' : 'bg-gray-200'}" style="left: {block.left}%; width: {block.width}%"></span>
                        {/each}
                    </span>
                {/each}
            </span>
        {:else}
            <span class="flex h-full gap-[3px] py-[3px]">
                {#each view.timeline.sections as section}
                    {@const here = isInRange(activeBar, section.bars)}
                    <span class="flex min-w-0 items-center overflow-hidden whitespace-nowrap rounded px-2.5 text-[13px] font-medium {here ? 'bg-primary-200 text-gray-900' : 'bg-gray-100 text-gray-600'}"
                        style="flex: {section.bars.count} 1 0">{section.name}</span>
                {/each}
            </span>
        {/if}
    </span>

    {#if startPoint !== null}
        <span class="absolute inset-y-0 -ml-px w-0.5 bg-primary-700" style="left: {percent(startPoint)}%"></span>
        <span class="absolute top-0 h-[18px] whitespace-nowrap rounded border border-primary-300 bg-primary-100 px-1.5 text-xs font-bold leading-4 text-primary-900"
            style="left: {percent(startPoint)}%">{startLabel}</span>
    {/if}
    <span class="absolute bottom-0 top-5 -ml-px w-0.5 bg-gray-900" style="left: {playedPercent}%"></span>
</button>
