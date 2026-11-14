<script lang="ts">
    import { Button, Input, Label } from 'flowbite-svelte';

    /** Create a song, and its folder in storage */
    let { songsFolder, busy, onCreate }: {
        songsFolder: string,
        busy: boolean,
        onCreate: (title: string, artist: string) => Promise<unknown>,
    } = $props();

    let title = $state('');
    let artist = $state('');

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        await onCreate(title.trim(), artist.trim());
        title = artist = '';
    }
</script>

<form class="flex w-full flex-col gap-2 text-left" onsubmit={submit}>
    <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-48 flex-1">
            <Label for="newSongTitle" class="mb-2">Song name</Label>
            <Input id="newSongTitle" bind:value={title} placeholder="e.g. Autumn Leaves" required disabled={busy} />
        </div>
        <div class="min-w-48 flex-1">
            <Label for="newSongArtist" class="mb-2">Artist</Label>
            <Input id="newSongArtist" bind:value={artist} placeholder="Optional" disabled={busy} />
        </div>
        <Button type="submit" disabled={busy}>Create song</Button>
    </div>
    <p class="text-[13px] text-gray-500">Creates the folder <span class="font-mono text-gray-700">{songsFolder}/&lt;song name&gt;</span> in your storage.</p>
</form>
