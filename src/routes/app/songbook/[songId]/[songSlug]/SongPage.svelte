<script lang="ts">
    import { secondsPerBar } from '$lib/chords/chartTimeline';
    import FolderBrowser from '$lib/components/songFolder/FolderBrowser.svelte';
    import DocumentViewer from '$lib/components/viewer/DocumentViewer.svelte';
    import PlayerBar from '$lib/components/player/PlayerBar.svelte';
    import type { SongFile } from '$lib/songFiles/songFile';
    import SongHeader from './SongHeader.svelte';
    import { SongPageState } from './songPage.svelte';

    /** Header, folder, viewer, and the player at the bottom of the screen (docs/songPage.md) */
    let { data } = $props();

    const song = data.song;
    const page = new SongPageState(song.id, data.rootFiles, data.folderError, {
        pinnedDocument: song.pinnedDocument ?? null,
        pinnedAudio: song.pinnedAudio ?? null,
    });

    let position = $state(0); // in the player, seconds
    let activeBar = $derived(page.chartIsPlaying && page.chartSource?.kind == 'chart'
        ? Math.floor(position / secondsPerBar(page.chartSource.timeline))
        : null);

    const isSame = (a: SongFile | null, b: SongFile) => a?.path == b.path;
</script>

<SongHeader songId={song.id} title={song.title} tags={song.tags.map((tag: { name: string }) => tag.name)} allTags={data.allTags}
    syncing={page.syncing} onSync={() => page.sync()} />

<div class="flex flex-col gap-6">
    <FolderBrowser rootName={song.storedDirName} folderPath={page.folderPath} files={page.files} error={page.folderError}
        isInViewer={file => isSame(page.viewerFile, file)}
        isInPlayer={file => isSame(page.chartIsPlaying ? page.viewerFile : page.playerFile, file)}
        isPinned={file => page.isPinned(file)}
        onBrowse={path => page.browse(path)} onOpen={file => page.open(file)} />

    <DocumentViewer songId={song.id} file={page.viewerFile} document={page.document} error={page.documentError}
        pinned={!!page.viewerFile && page.pins.pinnedDocument == page.viewerFile.path} onTogglePin={() => page.togglePin('pinnedDocument')}
        bind:transpose={page.transpose} {activeBar} />
</div>

{#if page.fileSource || page.chartSource}
    <PlayerBar songId={song.id} fileSource={page.fileSource} chartSource={page.chartSource} bind:playChart={page.playChart} bind:transpose={page.transpose}
        bind:position pinned={!!page.playerFile && page.pins.pinnedAudio == page.playerFile.path} soundfonts={data.soundfonts} onTogglePin={() => page.togglePin('pinnedAudio')}
        onCloseFile={() => page.closePlayerFile()} />
{/if}
