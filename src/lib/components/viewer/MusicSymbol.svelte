<script lang="ts">
    /** Segno, coda and fermata, as drawn on iReal Pro charts */
    let { symbol }: { symbol: 'segno' | 'coda' | 'fermata' } = $props();
</script>

<svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label={symbol} class="text-gray-900">
    {#if symbol == 'coda'}
        <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="1.3" />
    {:else if symbol == 'segno'}
        <path d="M11 4.5C10 3 6.5 3 6 5s5 3 4.5 5.5S6 13 5 11.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M3.5 13 12.5 3" stroke="currentColor" stroke-width="1.2" />
        <circle cx="4" cy="7" r="1" fill="currentColor" /><circle cx="12" cy="9" r="1" fill="currentColor" />
    {:else}
        <path d="M2 12a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="1.6" />
        <circle cx="8" cy="11" r="1.3" fill="currentColor" />
    {/if}
</svg>
