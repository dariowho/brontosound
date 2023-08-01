<script lang="ts">
    import { Spinner } from "flowbite-svelte";

    export let src: string;
    export let width: string = "100%";
    export let height: string = "200px";

    let loaded = false;

</script>

<div class="loading" style="width:{width}; height:{height};" class:hidden={loaded == true}>
    <Spinner />
</div>

<iframe title="Untitled Iframe" src="{src}" {width} {height} class="hidden" frameborder="0" class:hidden={loaded == false} on:load={() => (loaded = true)}></iframe>

<style>
    .loading {
        width: 100%;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hidden {
        display: none;
    }
</style>