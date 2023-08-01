<script lang="ts">
    import { page } from '$app/stores';
    import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
    import Markdown from '@magidoc/plugin-svelte-marked'
    import { Button } from 'flowbite-svelte';
    import Fa from 'svelte-fa/src/fa.svelte';

    export let data;
</script>

<div class="buttons">
    <Button href="{data.breadcrumb[data.breadcrumb.length-2].href}" color="alternative"><Fa icon={faArrowLeft} size="sm" /> &nbsp; Back</Button>
    <Button href="{$page.url.href}/edit">Edit</Button>
</div>
<div class="readme">
    <Markdown
        source={data.readme}
    />
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