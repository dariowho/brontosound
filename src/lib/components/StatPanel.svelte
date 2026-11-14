<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import { ArrowRightOutline } from 'flowbite-svelte-icons';

    /** Dashboard summary of one app area (docs/design-system/components/StatPanel). `children` is the optional callout. */
    let { title, icon, href, stats, children }: {
        title: string,
        icon: IconDefinition,
        href: string,
        stats: { label: string, value: string | number }[],
        children?: Snippet,
    } = $props();
</script>

<section class="flex flex-col rounded-lg border border-gray-200">
    <div class="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
        <h2 class="flex items-center gap-3 text-xl font-bold text-gray-900">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700"><Fa {icon} /></span>
            {title}
        </h2>
        <a {href} class="inline-flex items-center gap-2 text-sm font-medium text-primary-800 hover:text-primary-900">
            Open {title} <ArrowRightOutline class="h-5 w-5" />
        </a>
    </div>
    <dl class="grid grid-cols-3 divide-x divide-gray-200">
        {#each stats as { label, value }}
            <div class="flex flex-col-reverse justify-end gap-1 px-6 py-5">
                <dt class="text-sm text-gray-500">{label}</dt>
                <dd class="font-bold leading-9 text-gray-900 {typeof value === 'number' ? 'text-4xl' : 'text-xl'}">{value}</dd>
            </div>
        {/each}
    </dl>
    {#if children}
        <div class="px-6 pb-6">{@render children()}</div>
    {/if}
</section>
