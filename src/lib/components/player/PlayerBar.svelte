<script lang="ts">
    import { faBackwardStep, faChevronUp, faPause, faPlay, faRepeat, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import type { PlayerSource } from '$lib/player/loadEngine';
    import { formatTime, PlayerState } from '$lib/player/playerState.svelte';
    import { songFileUrl } from '$lib/songFiles/songFile';
    import type { SoundfontChoice } from '$lib/soundfonts';
    import BottomSheet from '../controls/BottomSheet.svelte';
    import DeleteConfirmRow from '../controls/DeleteConfirmRow.svelte';
    import PinButton from '../controls/PinButton.svelte';
    import ToggleButton from '../controls/ToggleButton.svelte';
    import PlayerExtras from './PlayerExtras.svelte';
    import PlayerSettings from './PlayerSettings.svelte';
    import SourcePicker from './SourcePicker.svelte';
    import Timeline from './Timeline.svelte';

    /**
     * The player, fixed to the bottom of the screen, made for practising (docs/songPage.md):
     * Space plays and pauses, every play starts from the start point, arrows move 5 s (a bar on a chart).
     * On phones it's a single bar that opens a sheet with every control.
     */
    let { editable, songId, fileSource, chartSource, playChart = $bindable(), transpose = $bindable(), position = $bindable(), pinned, soundfonts, onTogglePin, onCloseFile, onDeleteFile }: {
        editable: boolean, // pin and delete the file
        songId: number,
        fileSource: PlayerSource | null, // the audio or MIDI file in the player
        chartSource: PlayerSource | null, // the chart in the viewer, if it can drive the player
        playChart: boolean, // play the chart rather than the file
        transpose: number, // the chart's key, shared with the viewer
        position: number, // seconds, for the viewer to follow a chart
        pinned: boolean,
        soundfonts: SoundfontChoice, // for MIDI files
        onTogglePin: () => void,
        onCloseFile: () => void, // take the audio or MIDI file out of the player
        onDeleteFile: () => Promise<void>, // delete the audio or MIDI file from storage
    } = $props();

    let source = $derived(playChart && chartSource ? chartSource : fileSource ?? chartSource);
    let fileActions = $derived(editable && source?.kind == 'file'); // pin and delete
    const player = new PlayerState(songId, () => source);
    const transport = player.transport;
    let soundfont = $state(soundfonts.selected); // kept from file to file
    let sheetOpen = $state(false); // phones
    let confirmingDelete = $state<string | null>(null); // the path of the file asked about

    $effect(() => { position = transport.position; });

    let startLabel = $derived(transport.startPoint === null ? '' : player.isChart ? `Bar ${player.barOf(transport.startPoint)}` : formatTime(transport.startPoint));
    let playedPercent = $derived(transport.duration ? transport.position / transport.duration * 100 : 0);
    let playLabel = $derived(transport.playing ? 'Pause (Space)' : 'Play (Space)');
    let backLabel = $derived(transport.startPoint === null ? 'Go to the beginning' : 'Go to the start point');
    let fileName = $derived(fileSource?.file.name ?? '');

    /** Keys work anywhere on the page, except while typing */
    function onKeydown(event: KeyboardEvent) {
        if (!player.loaded || isTyping(event) || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.code == 'Space') transport.togglePlay();
        else if (event.key == 'ArrowLeft') transport.seekBy(-player.step);
        else if (event.key == 'ArrowRight') transport.seekBy(player.step);
        else return;
        event.preventDefault();
    }

    /** A focused button would also take Space as a click */
    function onKeyup(event: KeyboardEvent) {
        if (event.code == 'Space' && !isTyping(event)) event.preventDefault();
    }

    function isTyping(event: KeyboardEvent): boolean {
        const target = event.target as HTMLElement;
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
    }

    function closeFile() {
        sheetOpen = false;
        onCloseFile();
    }

    // The page scrolls clear of the player: one of the two bars is hidden, 0 px high
    let desktopHeight = $state(0);
    let phoneHeight = $state(0);
    $effect(() => {
        document.body.style.paddingBottom = `${desktopHeight + phoneHeight}px`;
        return () => { document.body.style.paddingBottom = ''; };
    });

    const iconButton = 'inline-flex shrink-0 items-center justify-center rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-300';
    const outline = 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50';
    const sheetRow = 'min-h-[64px] justify-between border-b border-gray-200 py-2';
</script>

<svelte:window onkeydown={onKeydown} onkeyup={onKeyup} />

{#snippet playButton(size: string)}
    <button type="button" class="{iconButton} {size} bg-primary-700 text-white hover:bg-primary-800" disabled={!player.loaded}
        onclick={() => transport.togglePlay()} aria-label={playLabel} title={playLabel}>
        <Fa icon={transport.playing ? faPause : faPlay} size="lg" />
    </button>
{/snippet}

{#snippet backButton(size: string)}
    <button type="button" class="{iconButton} {size} {outline}" disabled={!player.loaded} onclick={() => transport.goToStart()} aria-label={backLabel} title={backLabel}>
        <Fa icon={faBackwardStep} />
    </button>
{/snippet}

{#snippet timeline()}
    {#if player.view}
        <Timeline view={player.view} duration={transport.duration} position={transport.position} startPoint={transport.startPoint} {startLabel}
            loopRange={transport.loop ? transport.loopRange : null} snap={player.snap}
            onSetStart={time => transport.setStartPoint(time)} onSetLoop={(from, to) => transport.setLoop(from, to)} />
    {:else if player.loadError}
        <p class="flex-[1_1_360px] text-sm text-gray-600">
            Your browser can't play this file ({player.loadError}).
            {#if source?.kind == 'file'}<a href={songFileUrl(songId, source.file, true)} class="font-medium text-primary-800 hover:text-primary-900">Download it</a>{/if}
        </p>
    {:else}
        <p class="flex-[1_1_360px] text-sm text-gray-500">Loading…</p>
    {/if}
{/snippet}

{#snippet startPoint()}
    {#if transport.startPoint !== null}
        <span class="inline-flex h-9 items-center gap-1 rounded-lg border border-primary-300 bg-primary-100 pl-3 pr-1 text-sm font-medium text-primary-900">
            Plays from {player.label(transport.startPoint)}
            <button type="button" class="{iconButton} h-7 w-7 rounded-md" onclick={() => transport.clearStartPoint()} aria-label="Play from the start" title="Play from the start"><Fa icon={faXmark} size="sm" /></button>
        </span>
    {/if}
{/snippet}

{#snippet deleteButton(layout: string)}
    <button type="button" aria-expanded={confirmingDelete == fileSource?.file.path} onclick={() => confirmingDelete = fileSource?.file.path ?? null}
        class="{iconButton} {layout} gap-2 border border-red-300 px-3 text-[13px] font-medium text-red-700 hover:bg-red-50">
        <Fa icon={faTrashCan} size="xs" />Delete
    </button>
{/snippet}

{#snippet confirmDelete()}
    {#if fileSource && confirmingDelete == fileSource.file.path}
        <DeleteConfirmRow name={fileName} onCancel={() => confirmingDelete = null} onConfirm={onDeleteFile} />
    {/if}
{/snippet}

<!-- From tablets up: two rows -->
<section aria-label="Player" bind:offsetHeight={desktopHeight}
    class="fixed inset-x-0 bottom-0 z-30 hidden flex-col border-t border-gray-200 bg-white md:flex">
    {@render confirmDelete()}
    <div class="flex flex-col gap-3 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
        <div class="flex items-center gap-x-6 gap-y-3">
            <SourcePicker {fileSource} {chartSource} bind:playChart {onCloseFile} />
            <div class="flex items-center gap-3">
                {@render playButton('h-14 w-14')}
                {@render backButton('h-12 w-12')}
                <span class="w-[100px] text-center font-medium tabular-nums text-gray-900">
                    {formatTime(transport.position)} / {formatTime(transport.duration)}
                    {#if player.loaded?.kind == 'chart'}<span class="block text-[13px] font-normal text-gray-500">Bar {Math.min(player.barOf(transport.position), player.loaded.timeline.bars)} of {player.loaded.timeline.bars}</span>{/if}
                </span>
            </div>
            {@render timeline()}
            <ToggleButton on={transport.loop} onclick={() => transport.loop = !transport.loop} class="h-[42px] shrink-0 gap-2 px-4 text-sm"><Fa icon={faRepeat} size="sm" />Loop</ToggleButton>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                {@render startPoint()}
                <PlayerExtras {player} soundfonts={soundfonts.soundfonts} bind:soundfont />
            </div>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                <PlayerSettings {player} {source} bind:transpose />
                {#if fileActions}
                    <div class="flex gap-2">
                        <PinButton {pinned} onToggle={onTogglePin} />
                        {@render deleteButton('h-9')}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</section>

<!-- Phones: one bar, which opens the sheet -->
<section aria-label="Player" bind:offsetHeight={phoneHeight}
    class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
    <span class="absolute -top-px left-0 h-[3px] bg-primary-700" style="width: {playedPercent}%"></span>
    <div class="flex items-center gap-1 py-3 pl-4 pr-2">
        {@render playButton('h-12 w-12')}
        <button type="button" class="ml-2 flex min-w-0 flex-1 flex-col gap-0.5 py-1 text-left" onclick={() => sheetOpen = true} aria-label="Open the player">
            <span class="w-full truncate text-[15px] font-medium text-gray-900">{source?.file.name}</span>
            <span class="text-[13px] tabular-nums text-gray-500">{formatTime(transport.position)} / {formatTime(transport.duration)}</span>
        </button>
        <button type="button" class="{iconButton} h-11 w-11 text-gray-700" onclick={() => sheetOpen = true} aria-label="Open the player"><Fa icon={faChevronUp} /></button>
        {#if fileSource}
            <button type="button" class="{iconButton} h-11 w-11 text-gray-500" onclick={closeFile} aria-label="Close {fileName}"><Fa icon={faXmark} /></button>
        {/if}
    </div>
</section>

{#if sheetOpen}
    <BottomSheet label="Player" onClose={() => sheetOpen = false}>
        <div class="mt-1 flex items-start gap-2">
            <div class="flex min-w-0 flex-1"><SourcePicker {fileSource} {chartSource} bind:playChart onCloseFile={closeFile} /></div>
            {#if fileActions}<PinButton {pinned} onToggle={onTogglePin} class="h-10 shrink-0 gap-1.5" />{/if}
        </div>

        <div class="mt-6 flex flex-col">
            <div class="flex">{@render timeline()}</div>
            <div class="mt-2 flex justify-between text-[13px] tabular-nums text-gray-500">
                <span>{formatTime(transport.position)}</span><span>{formatTime(transport.duration)}</span>
            </div>
        </div>

        <div class="mt-4 flex items-center justify-center gap-5">
            {@render backButton('h-14 w-14')}
            {@render playButton('h-[72px] w-[72px]')}
            <button type="button" aria-pressed={transport.loop} aria-label="Loop" title="Loop" onclick={() => transport.loop = !transport.loop}
                class="{iconButton} h-14 w-14 border {transport.loop ? 'border-primary-300 bg-primary-100 text-primary-900' : outline}"><Fa icon={faRepeat} /></button>
        </div>
        <div class="mt-4 flex justify-center">{@render startPoint()}</div>

        <div class="mt-5 flex flex-col border-t border-gray-200">
            <PlayerSettings {player} {source} bind:transpose itemClass={sheetRow} />
            <PlayerExtras {player} soundfonts={soundfonts.soundfonts} bind:soundfont itemClass={sheetRow} />
        </div>
        {#if fileActions}
            <div class="-mx-6 mt-6 flex flex-col">
                <div class="px-6">{@render deleteButton('h-11 w-full')}</div>
                <div class="mt-3">{@render confirmDelete()}</div>
            </div>
        {/if}
    </BottomSheet>
{/if}
