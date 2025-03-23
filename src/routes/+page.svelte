<script>
    import { page } from "$app/state";

    const staticContent = page.data.staticContent;
</script>

{#if staticContent}
<div class="staticContent">
    {@html staticContent}
</div>

{:else}
    <p style="text-align:center; padding:2em">This is the band's public website</p>
{/if}