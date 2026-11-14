<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

    /** An area with nothing in it yet, and the way to add the first item (docs/design-system/components/EmptyState). */
    let { icon, title, children }: { icon: IconDefinition, title: string, children: Snippet } = $props();
</script>

<div class="mx-auto flex max-w-xl flex-col items-center gap-3 whitespace-normal py-14 text-center">
    <span class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-xl text-primary-700"><Fa {icon} /></span>
    <h2 class="mt-1 text-xl font-bold text-gray-900">{title}</h2>
    {@render children()}
</div>
