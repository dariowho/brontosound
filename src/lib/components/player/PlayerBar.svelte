<script lang="ts">
    import { faBackwardStep, faPause, faPlay, faRepeat, faXmark } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import { secondsPerBar } from '$lib/chords/chartTimeline';
    import { keyLabel } from '$lib/chords/chordSymbols';
    import { loadEngine, type LoadedEngine, type PlayerSource } from '$lib/player/loadEngine';
    import { Transport } from '$lib/player/transport.svelte';
    import { songFileUrl } from '$lib/songFiles/songFile';
    import type { SoundfontChoice } from '$lib/soundfonts';
    import PinButton from '../controls/PinButton.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import ToggleButton from '../controls/ToggleButton.svelte';
    import SourcePicker from './SourcePicker.svelte';
    import SoundfontPicker from './SoundfontPicker.svelte';
    import Timeline, { type TimelineView } from './Timeline.svelte';

    /**
     * The player, fixed to the bottom of the screen, made for practising (docs/songPage.md):
     * Space plays and pauses, every play starts from the start point, arrows move 5 s (a bar on a chart).
     */
    let { songId, fileSource, chartSource, playChart = $bindable(), transpose = $bindable(), position = $bindable(), pinned, soundfonts, onTogglePin, onCloseFile }: {
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
    } = $props();

    const transport = new Transport();
    let source = $derived(playChart && chartSource ? chartSource : fileSource ?? chartSource);
    let loaded = $state.raw<LoadedEngine | null>(null);
    let loadError = $state<string | null>(null);

    // Practice settings, back to the file's own for every file
    let speed = $state(100); // %, audio files
    let tempo = $state(120); // bpm, MIDI files and charts
    let pitch = $state(0); // semitones, audio and MIDI files
    let tracksOn = $state<boolean[]>([]);
    let click = $state(true);
    let countIn = $state(true);
    let soundfont = $state(soundfonts.selected); // kept from file to file

    $effect(() => {
        const current = source;
        if (!current) return;
        let cancelled = false;
        loaded = null;
        loadError = null;
        loadEngine(songId, current).then(engine => {
            if (cancelled) return engine.engine.dispose();
            resetSettings(engine);
            transport.attach(engine.engine);
            loaded = engine;
        }, e => loadError = (e as Error).message);
        return () => {
            cancelled = true;
            transport.attach(null);
            loaded?.engine.dispose();
        };
    });

    function resetSettings(engine: LoadedEngine) {
        speed = 100;
        pitch = 0;
        tempo = baseTempo(engine);
        tracksOn = engine.kind == 'midi' ? engine.engine.tracks.map(() => true) : [];
    }

    const baseTempo = (engine: LoadedEngine) => engine.kind == 'midi' ? engine.engine.tempo : engine.kind == 'chart' ? engine.timeline.tempo : 120;
    let isChart = $derived(loaded?.kind == 'chart');
    let usesTempo = $derived(loaded?.kind == 'midi' || loaded?.kind == 'chart');
    let rate = $derived(!loaded ? 1 : usesTempo ? tempo / baseTempo(loaded) : speed / 100);
    let barSeconds = $derived(loaded?.kind == 'chart' ? secondsPerBar(loaded.timeline) : 0);

    $effect(() => loaded?.engine.setSpeed(rate));
    $effect(() => loaded?.engine.setTranspose(pitch));
    $effect(() => {
        const metronome = loaded?.kind == 'chart' ? loaded.engine : null;
        if (!metronome) return;
        metronome.click = click;
        metronome.countIn = countIn;
    });
    $effect(() => {
        const midi = loaded?.kind == 'midi' ? loaded.engine : null;
        tracksOn.forEach((on, i) => midi?.setTrackEnabled(i, on));
    });
    $effect(() => { position = transport.position; });

    let view = $derived.by((): TimelineView | null => {
        if (loaded?.kind == 'audio') return { kind: 'waveform', peaks: loaded.peaks };
        if (loaded?.kind == 'midi') return { kind: 'tracks', lanes: loaded.lanes.map((blocks, i) => ({ blocks, enabled: tracksOn[i] })) };
        if (loaded?.kind == 'chart') return { kind: 'sections', timeline: loaded.timeline };
        return null;
    });

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    const barOf = (seconds: number) => Math.floor(seconds / barSeconds) + 1;
    const signed = (n: number) => n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0';
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    /** Charts start on a bar; files on the tenth of a second */
    const snap = (time: number) => isChart ? Math.floor(time / barSeconds) * barSeconds : Math.round(time * 10) / 10;
    let startLabel = $derived(transport.startPoint === null ? '' : isChart ? `Bar ${barOf(transport.startPoint)}` : formatTime(transport.startPoint));

    /** Keys work anywhere on the page, except while typing */
    function onKeydown(event: KeyboardEvent) {
        if (!loaded || isTyping(event) || event.ctrlKey || event.metaKey || event.altKey) return;
        const step = isChart ? barSeconds : 5;
        if (event.code == 'Space') transport.togglePlay();
        else if (event.key == 'ArrowLeft') transport.seekBy(-step);
        else if (event.key == 'ArrowRight') transport.seekBy(step);
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

    // The page scrolls clear of the player
    let height = $state(0);
    $effect(() => {
        document.body.style.paddingBottom = `${height}px`;
        return () => { document.body.style.paddingBottom = ''; };
    });

    const iconButton = 'inline-flex items-center justify-center rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-300';
</script>

<svelte:window onkeydown={onKeydown} onkeyup={onKeyup} />

<section aria-label="Player" bind:offsetHeight={height}
    class="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2.5 border-t border-gray-200 bg-white px-6 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <SourcePicker {fileSource} {chartSource} bind:playChart {onCloseFile} />

        <div class="flex items-center gap-2">
            <button type="button" class="{iconButton} h-12 w-12 bg-primary-700 text-white hover:bg-primary-800" disabled={!loaded}
                onclick={() => transport.togglePlay()} aria-label={transport.playing ? 'Pause (Space)' : 'Play (Space)'} title={transport.playing ? 'Pause (Space)' : 'Play (Space)'}>
                <Fa icon={transport.playing ? faPause : faPlay} size="lg" />
            </button>
            <button type="button" class="{iconButton} h-[42px] w-[42px] border border-gray-300 bg-white text-gray-900 hover:bg-gray-50" disabled={!loaded}
                onclick={() => transport.goToStart()} aria-label={transport.startPoint === null ? 'Go to the beginning' : 'Go to the start point'} title={transport.startPoint === null ? 'Go to the beginning' : 'Go to the start point'}>
                <Fa icon={faBackwardStep} />
            </button>
        </div>

        <div class="flex min-w-[104px] flex-col">
            <span class="text-[15px] font-medium tabular-nums text-gray-900">{formatTime(transport.position)} / {formatTime(transport.duration)}</span>
            {#if loaded?.kind == 'chart'}<span class="text-[13px] text-gray-500">Bar {Math.min(barOf(transport.position), loaded.timeline.bars)} of {loaded.timeline.bars}</span>{/if}
        </div>

        {#if view}
            <Timeline {view} duration={transport.duration} position={transport.position} startPoint={transport.startPoint} {startLabel}
                loopRange={transport.loop ? transport.loopRange : null} {snap}
                onSetStart={time => transport.setStartPoint(time)} onSetLoop={(from, to) => transport.setLoop(from, to)} />
        {:else if loadError}
            <p class="flex-[1_1_360px] text-sm text-gray-600">
                Your browser can't play this file ({loadError}).
                {#if source?.kind == 'file'}<a href={songFileUrl(songId, source.file, true)} class="font-medium text-primary-800 hover:text-primary-900">Download it</a>{/if}
            </p>
        {:else}
            <p class="flex-[1_1_360px] text-sm text-gray-500">Loading…</p>
        {/if}
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            {#if transport.startPoint !== null}
                <span class="inline-flex h-8 items-center gap-1 rounded-lg border border-primary-300 bg-primary-100 pl-2.5 pr-1 text-[13px] font-medium text-primary-900">
                    Plays from {isChart ? `bar ${barOf(transport.startPoint)}` : formatTime(transport.startPoint)}
                    <button type="button" class="{iconButton} h-6 w-6 rounded-md" onclick={() => transport.clearStartPoint()} aria-label="Clear the start point" title="Clear the start point"><Fa icon={faXmark} size="sm" /></button>
                </span>
            {:else}
                <span class="hidden text-[13px] text-gray-500 sm:inline">Click the timeline to set where every play starts, drag to loop a part. Space plays and pauses.</span>
            {/if}

            {#if loaded?.kind == 'midi'}
                <div role="group" aria-label="Tracks" class="flex flex-wrap items-center gap-1.5">
                    <span class="mr-1 text-sm text-gray-500">Tracks</span>
                    {#each loaded.engine.tracks as track, i}
                        <ToggleButton dot on={tracksOn[i]} onclick={() => tracksOn[i] = !tracksOn[i]}>{track.name}</ToggleButton>
                    {/each}
                </div>
                <SoundfontPicker engine={loaded.engine} soundfonts={soundfonts.soundfonts} bind:selected={soundfont} />
            {:else if loaded?.kind == 'chart'}
                <div role="group" aria-label="Metronome" class="flex flex-wrap items-center gap-1.5">
                    <span class="mr-1 text-sm text-gray-500">Metronome</span>
                    <ToggleButton dot on={click} onclick={() => click = !click}>Click</ToggleButton>
                    <ToggleButton dot on={countIn} onclick={() => countIn = !countIn}>Count-in</ToggleButton>
                </div>
            {/if}
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            {#if usesTempo}
                <Stepper label="Tempo" value="{tempo} bpm" decreaseLabel="Slower" increaseLabel="Faster"
                    onDecrease={() => tempo = clamp(tempo - 2, 40, 240)} onIncrease={() => tempo = clamp(tempo + 2, 40, 240)} />
            {:else}
                <Stepper label="Speed" value="{speed}%" decreaseLabel="Slower" increaseLabel="Faster"
                    onDecrease={() => speed = clamp(speed - 5, 50, 150)} onIncrease={() => speed = clamp(speed + 5, 50, 150)} />
            {/if}
            {#if source?.kind == 'chart'}
                <Stepper label="Key" value={keyLabel(source.key, transpose)} decreaseLabel="Transpose down a semitone" increaseLabel="Transpose up a semitone"
                    onDecrease={() => transpose = clamp(transpose - 1, -11, 11)} onIncrease={() => transpose = clamp(transpose + 1, -11, 11)} />
            {:else}
                <Stepper label="Pitch" value={signed(pitch)} decreaseLabel="Pitch down a semitone" increaseLabel="Pitch up a semitone"
                    onDecrease={() => pitch = clamp(pitch - 1, -12, 12)} onIncrease={() => pitch = clamp(pitch + 1, -12, 12)} />
            {/if}
            <ToggleButton on={transport.loop} onclick={() => transport.loop = !transport.loop}><Fa icon={faRepeat} size="sm" />Loop</ToggleButton>
            {#if source?.kind == 'file'}<PinButton {pinned} onToggle={onTogglePin} />{/if}
        </div>
    </div>
</section>
