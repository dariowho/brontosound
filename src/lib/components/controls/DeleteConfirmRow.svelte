<script lang="ts">
    /** The confirmation under a Delete button: the only solid red button */
    let { name, onCancel, onConfirm }: {
        name: string,
        onCancel: () => void,
        onConfirm: () => Promise<void>,
    } = $props();

    let deleting = $state(false);
    let error = $state<string | null>(null);

    async function confirm() {
        deleting = true;
        error = null;
        try {
            await onConfirm();
        } catch (e) {
            error = `Couldn't delete it: ${(e as Error).message}`;
        }
        deleting = false;
    }

    const button = 'inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium focus:outline-none focus:ring-4';
</script>

<div role="alert" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-red-300 bg-red-50 py-3 pl-4 pr-4 sm:pl-6">
    <p class="text-sm text-gray-900">
        Delete <span class="font-medium">{name}</span> from your storage? This can't be undone.
        {#if error}<span class="block text-red-700">{error}</span>{/if}
    </p>
    <div class="flex gap-2">
        <button type="button" class="{button} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-primary-300" onclick={onCancel}>Cancel</button>
        <button type="button" class="{button} bg-red-700 text-white hover:bg-red-800 focus:ring-red-300" disabled={deleting} onclick={confirm}>Delete permanently</button>
    </div>
</div>
