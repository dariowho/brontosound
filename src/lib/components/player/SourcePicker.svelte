<script lang="ts">
    import { faPlay, faXmark } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import { fileTypeLabel } from '$lib/songFiles/fileTypes';
    import type { PlayerSource } from '$lib/player/loadEngine';

    /**
     * What the player plays. With an audio file loaded and a chart in the viewer, the player asks which:
     * the audio file is the default.
     */
    let { fileSource, chartSource, playChart = $bindable(), onCloseFile }: {
        fileSource: PlayerSource | null,
        chartSource: PlayerSource | null,
        playChart: boolean,
        onCloseFile: () => void, // take the audio or MIDI file out of the player
    } = $props();

    let only = $derived(fileSource ?? chartSource);
</script>

{#snippet closeFileButton()}
    <button type="button" onclick={onCloseFile} aria-label="Close {fileSource?.file.name}" title="Close this file"
        class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-300">
        <Fa icon={faXmark} size="sm" />
    </button>
{/snippet}

{#snippet playBadge(size: string)}
    <span class="inline-flex shrink-0 items-center justify-center rounded-full bg-charcoal text-white {size}"><Fa icon={faPlay} size="xs" /></span>
{/snippet}

{#snippet option(label: string, extra: string, selected: boolean, select: () => void)}
    <button type="button" role="radio" aria-checked={selected} onclick={select}
        class="flex max-w-full items-center gap-2 rounded-md px-1.5 py-0.5 text-left text-sm {selected ? 'font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}">
        {#if selected}{@render playBadge('h-[18px] w-[18px] text-[7px]')}{:else}<span class="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-gray-500"></span>{/if}
        <span class="min-w-0 truncate">{label}</span>
        {#if extra}<span class="shrink-0 font-normal text-gray-500">· {extra}</span>{/if}
    </button>
{/snippet}

<div class="min-w-0 flex-[0_1_280px]">
    {#if fileSource && chartSource}
        <div role="radiogroup" aria-label="What to play" class="flex flex-col gap-0.5">
            <div class="flex min-w-0 items-center gap-1">
                {@render option(fileSource.file.name, '', !playChart, () => playChart = false)}
                {@render closeFileButton()}
            </div>
            {@render option(chartSource.file.name, 'Metronome', playChart, () => playChart = true)}
        </div>
    {:else if only}
        <div class="flex min-w-0 items-center gap-2.5">
            {@render playBadge('h-[22px] w-[22px] text-[9px]')}
            <div class="flex min-w-0 flex-col">
                <span class="flex min-w-0 items-center gap-1">
                    <span class="truncate text-[15px] font-medium text-gray-900">{only.file.name}</span>
                    {#if only.kind == 'file'}{@render closeFileButton()}{/if}
                </span>
                <span class="text-[13px] text-gray-500">{only.kind == 'chart' ? 'Metronome' : fileTypeLabel(only.file)}</span>
            </div>
        </div>
    {/if}
</div>
