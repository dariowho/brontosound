<script lang="ts">
    import Stepper from './Stepper.svelte';

    /** A whole number between − and + buttons, which can also be typed (Enter or leaving the field sets it) */
    let { label, value = $bindable(), min, max, step = 1, unit = '', signed = false, decreaseLabel, increaseLabel, class: className }: {
        label: string,
        value: number,
        min: number,
        max: number,
        step?: number, // for the buttons and the arrow keys
        unit?: string, // after the value: "bpm"
        signed?: boolean, // shown as +2, −3
        decreaseLabel: string,
        increaseLabel: string,
        class?: string,
    } = $props();

    const format = (n: number) => !signed || n == 0 ? String(n) : n > 0 ? `+${n}` : `−${-n}`;
    const set = (n: number) => value = Math.min(max, Math.max(min, n));

    function typed(event: Event & { currentTarget: HTMLInputElement }) {
        const n = parseInt(event.currentTarget.value.replace('−', '-').replace('+', ''));
        if (!isNaN(n)) set(n);
        event.currentTarget.value = format(value); // also when the value didn't change
    }

    function onKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
            event.preventDefault();
            set(value + (event.key == 'ArrowUp' ? step : -step));
        } else if (event.key == 'Escape') {
            event.currentTarget.value = format(value);
            event.currentTarget.blur();
        }
    }
</script>

<Stepper {label} {decreaseLabel} {increaseLabel} class={className} onDecrease={() => set(value - step)} onIncrease={() => set(value + step)}>
    <input value={format(value)} onchange={typed} onkeydown={onKeydown} inputmode="numeric" aria-label={label} enterkeyhint="done"
        class="w-10 border-none bg-transparent p-0 text-center text-base font-medium tabular-nums text-gray-900 focus:outline-none focus:ring-0 md:text-sm {unit ? 'text-right' : ''}" />
    {#if unit}<span class="font-normal text-gray-500">{unit}</span>{/if}
</Stepper>
