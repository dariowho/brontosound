<script lang="ts">
    import { Button } from "flowbite-svelte";
    import { fetchApi } from "$lib/db";

    let testing = false;
    let testResult: { read: string | null, write: string | null } | null = null;

    async function testConnection() {
        testing = true;
        testResult = null;
        try {
            testResult = await fetchApi('/api/storage/test', { method: 'POST' });
            if (testResult?.read) console.error("Storage read test failed:", testResult.read);
            if (testResult?.write) console.error("Storage write test failed:", testResult.write);
        } catch (e) {
            console.error("Storage test failed:", e);
            testResult = { read: (e as Error).message, write: (e as Error).message };
        } finally {
            testing = false;
        }
    }
</script>

<div class="mt-4 flex items-center gap-4">
    <Button size="xs" disabled={testing} on:click={testConnection}>Test connection</Button>
    {#if testResult}
        {#each [['Read', testResult.read], ['Write', testResult.write]] as [name, error]}
            <span class="flex items-center gap-1 text-sm">
                <span class="h-2.5 w-2.5 rounded-full {error ? 'bg-red-500' : 'bg-green-500'}"></span>{name}
            </span>
        {/each}
    {/if}
</div>
