<script lang="ts">
    import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import ToggleButton from './ToggleButton.svelte';

    /** Pin a file so it opens with the song */
    let { pinned, onToggle, class: className }: { pinned: boolean, onToggle: () => void, class?: string } = $props();
</script>

<ToggleButton on={pinned} onclick={onToggle} class={className} title={pinned ? 'Opens with this song. Select to unpin.' : 'Open this file automatically with the song'}>
    <Fa icon={faThumbtack} size="xs" />{pinned ? 'Pinned' : 'Pin'}
</ToggleButton>
