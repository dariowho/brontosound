<script lang="ts">
    import { page } from '$app/stores';
    import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
    import Markdown from '@magidoc/plugin-svelte-marked'
    import { Button } from 'flowbite-svelte';
    import Fa from 'svelte-fa/src/fa.svelte';
    import PlaceholderBox from '../../../PlaceholderBox.svelte';

    export let data;
</script>

<div class="buttons">
    <Button href="{data.breadcrumb[data.breadcrumb.length-2].href}" color="alternative"><Fa icon={faArrowLeft} size="sm" /> &nbsp; Back</Button>
    <Button href="{$page.url.href}/edit">Edit</Button>
</div>
<div class="readme">
    {#if data.readme}
        <Markdown
            source={data.readme}
        />
    {:else}
        <PlaceholderBox>
            <p>Your README.md appears to be empty. Press "Edit" to add your content!</p>
        </PlaceholderBox>
    {/if}
    
</div>

<style>
    .readme {
        font-size: 1.2em;
    }

    :global(.readme p) {
        margin-bottom: 1em;
    }

    :global(.readme a) {
        text-decoration: underline;
    }

    .buttons {
        margin-bottom: 1em;
    }
</style>