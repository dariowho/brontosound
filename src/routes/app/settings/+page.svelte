<script lang="ts">
    import { Accordion, AccordionItem } from "flowbite-svelte";
    import UsersSettings from "./UsersSettings.svelte";
    import SettingField from "./SettingField.svelte";
    import TestStorage from "./TestStorage.svelte";
    import { can } from "$lib/permissions";
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
            {#if section.hint}
                <p class="mb-4 text-sm text-gray-500">{section.hint}</p>
            {/if}
            <div class="space-y-4">
                {#each section.entries as entry}
                    <SettingField {entry} />
                {/each}
            </div>
            {#if section.title === "WebDAV" && can(data.brontoSession, 'bandSettings.write')}
                <TestStorage />
            {/if}
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">Read-only. Edit <code>data/{data.settingsFilename}</code> and restart the app.</p>
        </AccordionItem>
    {/each}
</Accordion>
