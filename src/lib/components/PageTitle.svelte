<script lang="ts">
    import type { Snippet } from 'svelte';

    /** The page's H1, with optional page actions on its right (see docs/design-system/components/Breadcrumb). */
    let { title, actions }: { title: string, actions?: Snippet } = $props();
</script>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <h1 class="break-words text-5xl font-bold tracking-tight text-gray-900">{title}</h1>
    {#if actions}
        <div class="flex flex-wrap items-center gap-3">{@render actions()}</div>
    {/if}
</div>
