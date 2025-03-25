<script>
    import { page } from "$app/state";
    import BrontoHeader from "./BrontoHeader.svelte";

    const staticContent = page.data.staticContent;
</script>

<BrontoHeader solid={false} />

{#if staticContent}
<div class="staticContent">
    {@html staticContent}
</div>

{:else}
    <p style="text-align:center; padding:2em">This is the band's public website</p>
{/if}