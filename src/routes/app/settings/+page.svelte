<script lang="ts">
    import { Accordion, AccordionItem, Input, Label, Toggle } from "flowbite-svelte";
    import UsersSettings from "./UsersSettings.svelte";
    import TestStorage from "./TestStorage.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>


<Accordion>
    {#if data.users}
        <AccordionItem>
            <span slot="header">Users</span>
            <UsersSettings users={data.users} currentUserId={data.brontoSession.user.id} />
        </AccordionItem>
    {/if}

    {#each data.settings as section}
        <AccordionItem>
            <span slot="header">{section.title}</span>
            <div class="space-y-4">
                {#each Object.entries(section.entries) as [label, value]}
                    {#if typeof value === 'boolean'}
                        <Toggle checked={value} disabled>{label}</Toggle>
                    {:else}
                        <Label>{label}<Input class="mt-1" value={value ?? ''} disabled /></Label>
                    {/if}
                {/each}
            </div>
            {#if section.title === "WebDAV"}
                <TestStorage />
            {/if}
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">Read-only. Edit <code>data/{data.settingsFilename}</code> and restart the app.</p>
        </AccordionItem>
    {/each}
</Accordion>
