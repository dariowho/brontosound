<script lang="ts">
    import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

    /** A labelled value with − and + buttons, like Key, Speed or Tempo */
    let { label, value, decreaseLabel, increaseLabel, onDecrease, onIncrease }: {
        label: string,
        value: string,
        decreaseLabel: string, // for screen readers: "Transpose down a semitone"
        increaseLabel: string,
        onDecrease: () => void,
        onIncrease: () => void,
    } = $props();

    const stepButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-300';
</script>

<div role="group" aria-label={label} class="flex items-center gap-1.5">
    <span class="mr-1 text-sm text-gray-500">{label}</span>
    <button type="button" class={stepButton} aria-label={decreaseLabel} title={decreaseLabel} onclick={onDecrease}><Fa icon={faMinus} size="xs" /></button>
    <span class="min-w-[64px] text-center text-sm font-medium tabular-nums text-gray-900">{value}</span>
    <button type="button" class={stepButton} aria-label={increaseLabel} title={increaseLabel} onclick={onIncrease}><Fa icon={faPlus} size="xs" /></button>
</div>

