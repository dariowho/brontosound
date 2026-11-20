<script lang="ts">
    import { keyLabel } from '$lib/chords/chordSymbols';
    import type { PlayerSource } from '$lib/player/loadEngine';
    import type { PlayerState } from '$lib/player/playerState.svelte';
    import NumberStepper from '../controls/NumberStepper.svelte';
    import Stepper from '../controls/Stepper.svelte';

    /** Tempo (or speed), and transposition: Key for a chart, Transpose and Pitch for a file */
    let { player, source, transpose = $bindable(), itemClass = '' }: {
        player: PlayerState,
        source: PlayerSource | null,
        transpose: number, // the chart's key, shared with the viewer
        itemClass?: string, // each control's layout
    } = $props();

    const clamp = (value: number) => Math.min(11, Math.max(-11, value));
</script>

{#if player.usesTempo}
    <NumberStepper label="Tempo" bind:value={player.tempo} min={20} max={300} unit="bpm" decreaseLabel="Slower" increaseLabel="Faster" class={itemClass} />
{:else}
    <NumberStepper label="Speed" bind:value={player.speed} min={50} max={150} step={5} unit="%" decreaseLabel="Slower" increaseLabel="Faster" class={itemClass} />
{/if}
{#if source?.kind == 'chart'}
    <Stepper label="Key" value={keyLabel(source.key, transpose)} decreaseLabel="Transpose down a semitone" increaseLabel="Transpose up a semitone" class={itemClass}
        onDecrease={() => transpose = clamp(transpose - 1)} onIncrease={() => transpose = clamp(transpose + 1)} />
{:else}
    <NumberStepper label="Transpose" bind:value={player.semitones} min={-12} max={12} signed decreaseLabel="Down a semitone" increaseLabel="Up a semitone" class={itemClass} />
    <NumberStepper label="Pitch" bind:value={player.cents} min={-50} max={50} signed unit="cents" decreaseLabel="Lower by one cent" increaseLabel="Raise by one cent" class={itemClass} />
{/if}
