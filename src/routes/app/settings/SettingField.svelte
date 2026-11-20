<script lang="ts">
    import { Input, Label, Select, Toggle } from 'flowbite-svelte';
    import type { SettingEntry } from './settingEntries';

    /** A read-only setting, labelled with its bandSettings.json key. */
    let { entry }: { entry: SettingEntry } = $props();
</script>

{#snippet key()}
    <code class="ms-1 font-mono text-xs font-normal text-gray-500">{entry.key}</code>
{/snippet}

{#if entry.kind === 'toggle'}
    <Toggle checked={entry.value} disabled>{entry.label}{@render key()}</Toggle>
{:else}
    <Label>
        {entry.label}{@render key()}
        {#if entry.kind === 'choice'}
            <Select class="mt-1" items={entry.options} value={entry.value} disabled />
        {:else if entry.kind === 'secret'}
            <Input class="mt-1" value={entry.isSet ? 'Set (hidden)' : ''} placeholder="Not set" disabled />
        {:else}
            <Input class="mt-1" value={entry.value} placeholder="Not set" disabled />
        {/if}
    </Label>
{/if}
