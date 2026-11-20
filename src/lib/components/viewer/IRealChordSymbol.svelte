<script lang="ts">
    import type { IRealChord } from '$lib/chords/iRealPro';

    /** A chord written the iReal Pro way: the root large, the quality raised, △ for major 7, − for minor, ø, ° */
    let { chord, transpose, small = false }: {
        chord: IRealChord,
        transpose: (note: string) => string,
        small?: boolean,
    } = $props();

    const QUALITY_SIGNS: Record<string, string> = { '^': '△', '-': '−', h: 'ø', o: '°' };
    const prettyQuality = (quality: string) => quality.replace(/[\^\-ho]/g, sign => QUALITY_SIGNS[sign]);
    const prettyAccidental = (note: string) => note.slice(1).replace('b', '♭').replace('#', '♯');

    let root = $derived(chord.root == 'W' ? '' : transpose(chord.root)); // W: an invisible root
    let bass = $derived(chord.bass && transpose(chord.bass));
</script>

<!-- on one line: whitespace would separate the root from its accidental -->
<span class="inline-flex items-start whitespace-nowrap font-bold leading-none text-gray-900 {small ? 'text-sm' : 'text-xl'}"><span>{root.charAt(0)}</span>{#if prettyAccidental(root)}<span class="text-[0.6em]">{prettyAccidental(root)}</span>{/if}{#if chord.quality}<span class="ml-px text-[0.6em]">{prettyQuality(chord.quality)}</span>{/if}{#if bass}<span class="self-end text-[0.65em]">/{bass}</span>{/if}</span>
