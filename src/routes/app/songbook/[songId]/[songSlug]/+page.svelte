<script lang="ts">
    import SongPage from './SongPage.svelte';

    let { data } = $props();
</script>

<!-- A new page state for every song, also when navigating from one song to another -->
{#key data.song.id}
    <SongPage {data} />
{/key}
