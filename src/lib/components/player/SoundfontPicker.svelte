<script lang="ts">
    import type { MidiEngine } from '$lib/player/midiEngine';
    import type { Soundfont } from '$lib/soundfonts';

    /** Which soundfont plays the MIDI file; the pick is remembered for the user (docs/songPage.md) */
    let { engine, soundfonts, selected = $bindable(), class: className = '' }: { engine: MidiEngine, soundfonts: Soundfont[], selected: string, class?: string } = $props();

    let loading = $state(false);
    let failed = $state<string | null>(null); // the soundfont that couldn't load: the built-in synth plays

    $effect(() => {
        const soundfont = soundfonts.find(soundfont => soundfont.name == selected);
        if (!soundfont) return;
        loading = true;
        failed = null;
        engine.useSoundfont(soundfont.url).then(() => loading = false, () => {
            loading = false;
            failed = soundfont.name;
            engine.useSoundfont(null);
        });
    });

    function pick(name: string) {
        selected = name;
        fetch('/api/soundfont', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    }
</script>

{#if soundfonts.length > 1}
    <label class="flex flex-wrap items-center gap-2 text-base text-gray-700 md:text-sm md:text-gray-500 {className}">
        Sound
        <select class="h-11 rounded-lg border border-gray-300 bg-gray-50 py-0 pl-2.5 pr-8 text-base text-gray-900 md:h-9 md:text-sm focus:border-primary-500 focus:ring-primary-500"
            value={selected} onchange={event => pick(event.currentTarget.value)}>
            {#each soundfonts as soundfont}<option value={soundfont.name}>{soundfont.name}</option>{/each}
        </select>
        {#if loading}<span>Loading…</span>{:else if failed}<span>Couldn't load {failed}: built-in synth</span>{/if}
    </label>
{/if}
