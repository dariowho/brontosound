<script lang="ts">
    import type { ChordSegment } from '$lib/chords/chordChart';

    /** Lyrics with each chord above the syllable it starts on */
    let { segments, transpose, active = false }: {
        segments: ChordSegment[],
        transpose: (chord: string) => string,
        active?: boolean, // the line the player is on
    } = $props();

    let hasChords = $derived(segments.some(segment => segment.chord || segment.annotation));
    let hasLyrics = $derived(segments.some(segment => segment.lyrics.trim()));
</script>

<div class="-mx-2.5 flex flex-wrap items-end rounded px-2.5 py-0.5 {active ? 'bg-primary-100' : ''}">
    {#each segments as segment}
        <span class="inline-flex flex-col whitespace-pre">
            {#if hasChords}
                <span class="min-h-[22px] text-[15px] font-bold leading-[22px] {hasLyrics ? 'pr-1.5' : 'pr-5'} {segment.annotation ? 'text-gray-600' : 'text-primary-800'}">
                    {segment.annotation ?? (segment.chord ? transpose(segment.chord) : '')}
                </span>
            {/if}
            {#if hasLyrics}<span class="text-lg leading-7 text-gray-900">{segment.lyrics}</span>{/if}
        </span>
    {/each}
</div>
