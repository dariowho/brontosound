<script lang="ts">
    import type { PlayerState } from '$lib/player/playerState.svelte';
    import type { Soundfont } from '$lib/soundfonts';
    import ToggleButton from '../controls/ToggleButton.svelte';
    import SoundfontPicker from './SoundfontPicker.svelte';

    /** What only some sources have: a MIDI file's tracks and sound, a chart's metronome */
    let { player, soundfonts, soundfont = $bindable(), itemClass = '' }: {
        player: PlayerState,
        soundfonts: Soundfont[],
        soundfont: string,
        itemClass?: string, // each control's layout
    } = $props();

    const toggle = 'h-11 gap-2 text-[15px] md:h-9 md:text-[13px]';
</script>

{#snippet group(label: string, switches: { name: string, on: boolean, toggle: () => void }[])}
    <div role="group" aria-label={label} class="flex flex-wrap items-center gap-1.5 {itemClass}">
        <span class="mr-1 text-base text-gray-700 md:text-sm md:text-gray-500">{label}</span>
        <span class="flex flex-wrap justify-end gap-1.5">
            {#each switches as item}<ToggleButton dot on={item.on} onclick={item.toggle} class={toggle}>{item.name}</ToggleButton>{/each}
        </span>
    </div>
{/snippet}

{#if player.loaded?.kind == 'midi'}
    {@render group('Tracks', player.loaded.engine.tracks.map((track, i) => ({ name: track.name, on: player.tracksOn[i], toggle: () => player.tracksOn[i] = !player.tracksOn[i] })))}
    <SoundfontPicker engine={player.loaded.engine} {soundfonts} bind:selected={soundfont} class={itemClass} />
{:else if player.loaded?.kind == 'chart'}
    {@render group('Metronome', [
        { name: 'Click', on: player.click, toggle: () => player.click = !player.click },
        { name: 'Count-in', on: player.countIn, toggle: () => player.countIn = !player.countIn },
    ])}
{/if}
