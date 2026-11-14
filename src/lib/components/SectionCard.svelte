<script lang="ts">
    import type { Component } from 'svelte';
    import { ArrowRightOutline } from 'flowbite-svelte-icons';

    /**
     * One subsection of an app area (docs/design-system/components/SectionCard).
     * Without `href` the card shows as "Coming soon" and `footer` says where to find the thing today.
     */
    let { title, description, icon, href, footer, action }: {
        title: string,
        description: string,
        icon: Component<{ class?: string }>,
        href?: string,
        footer: string,
        action?: string,
    } = $props();
</script>

<svelte:element this={href ? 'a' : 'div'} {href}
    class="flex flex-col gap-4 rounded-lg border bg-white p-6 text-gray-900 {href ? 'border-gray-200 hover:border-primary-300' : 'border-dashed border-gray-300'}">
    <span class="flex h-11 w-11 items-center justify-center rounded-lg {href ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}">
        {#if icon}{@const Icon = icon}<Icon class="h-6 w-6" />{/if}
    </span>
    <span class="flex flex-1 flex-col gap-2">
        <span class="flex items-center gap-2.5">
            <span class="text-[22px] font-bold leading-tight">{title}</span>
            {#if !href}<span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Coming soon</span>{/if}
        </span>
        <span class="text-[15px] leading-normal text-gray-600">{description}</span>
    </span>
    <span class="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm">
        <span class="text-gray-500">{footer}</span>
        {#if href && action}
            <span class="inline-flex items-center gap-2 font-medium text-primary-800">{action} <ArrowRightOutline class="h-5 w-5" /></span>
        {/if}
    </span>
</svelte:element>
