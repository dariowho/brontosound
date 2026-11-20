<script lang="ts">
    import type { Snippet } from 'svelte';
    import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

    /** A labelled value between − and + buttons, like Key. `NumberStepper` makes the value editable. */
    let { label, value, decreaseLabel, increaseLabel, onDecrease, onIncrease, class: className = '', children }: {
        label: string,
        value?: string,
        decreaseLabel: string, // for screen readers: "Transpose down a semitone"
        increaseLabel: string,
        onDecrease: () => void,
        onIncrease: () => void,
        class?: string, // layout of the label and the control
        children?: Snippet, // in place of `value`
    } = $props();

    const stepButton = 'flex w-11 items-center justify-center bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:bg-primary-50 md:w-9';
</script>

<div role="group" aria-label={label} class="flex items-center gap-2 {className}">
    <span class="text-base text-gray-700 md:text-sm md:text-gray-500">{label}</span>
    <div class="flex h-11 items-stretch overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 md:h-9">
        <button type="button" class="{stepButton} border-r border-gray-300" aria-label={decreaseLabel} title={decreaseLabel} onclick={onDecrease}><Fa icon={faMinus} size="xs" /></button>
        <span class="flex min-w-[96px] items-center justify-center gap-1 bg-gray-50 md:min-w-[64px] px-2.5 text-sm font-medium tabular-nums text-gray-900">
            {#if children}{@render children()}{:else}{value}{/if}
        </span>
        <button type="button" class="{stepButton} border-l border-gray-300" aria-label={increaseLabel} title={increaseLabel} onclick={onIncrease}><Fa icon={faPlus} size="xs" /></button>
    </div>
</div>
