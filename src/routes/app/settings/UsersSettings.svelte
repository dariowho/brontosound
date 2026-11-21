<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Alert, Badge, Button, Input, Label, Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
    import { UserRole } from "$lib/dbEntities/user";
    import type { PageData } from "./$types";
    import { MIN_PASSWORD_LENGTH } from "$lib/passwordPolicy";

    export let users: NonNullable<PageData['users']>;
    export let currentUserId: number;

    const roleItems = Object.values(UserRole).map(role => ({ value: role, name: role }));

    let email = "";
    let name = "";
    let password = "";
    let role = UserRole.EDITOR;
    let errorMessage = "";
    let busy = false;

    async function request(url: string, init: RequestInit) {
        busy = true;
        errorMessage = "";
        try {
            const res = await fetch(url, init);
            if (!res.ok) {
                errorMessage = (await res.json().catch(() => null))?.message ?? res.statusText;
                return false;
            }
            await invalidateAll();
            return true;
        } catch {
            errorMessage = "Network error, try again.";
            return false;
        } finally {
            busy = false;
        }
    }

    async function addUser() {
        if (await request('/api/user', { method: 'POST', body: JSON.stringify({ email, name, password, role }) })) {
            email = name = password = "";
            role = UserRole.EDITOR;
        }
    }

    async function resetTwoStep(user: typeof users[number]) {
        if (confirm(`Turn off two-step verification for ${user.name}? They can sign in with their password alone, then set it up again.`)) {
            await request(`/api/user/${user.id}/two-step`, { method: 'DELETE' });
        }
    }

    async function removeUser(user: typeof users[number]) {
        if (confirm(`Remove ${user.name} (${user.login})? They will no longer be able to sign in.`)) {
            await request(`/api/user/${user.id}`, { method: 'DELETE' });
        }
    }
</script>

{#if errorMessage}
    <Alert color="red" class="mb-4">{errorMessage}</Alert>
{/if}

<Table>
    <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Login</TableHeadCell>
        <TableHeadCell>Role</TableHeadCell>
        <TableHeadCell>Sign-in</TableHeadCell>
        <TableHeadCell><span class="sr-only">Remove</span></TableHeadCell>
    </TableHead>
    <TableBody>
        {#each users as user (user.id)}
            <TableBodyRow>
                <TableBodyCell>{user.name}</TableBodyCell>
                <TableBodyCell>{user.login}</TableBodyCell>
                <TableBodyCell>{user.role}</TableBodyCell>
                <TableBodyCell>
                    {#each user.signInMethods as method}
                        <Badge class="mr-1">{method}</Badge>
                    {/each}
                    {#if user.signInMethods.includes('two-step')}
                        <Button size="xs" color="light" disabled={busy} on:click={() => resetTwoStep(user)}>Reset two-step</Button>
                    {/if}
                </TableBodyCell>
                <TableBodyCell>
                    {#if user.id === currentUserId}
                        <span class="text-gray-500">You</span>
                    {:else if user.managedBySettings}
                        <span class="text-gray-500" title="Configured in bandSettings.json">Band settings</span>
                    {:else}
                        <Button size="xs" color="red" outline disabled={busy} on:click={() => removeUser(user)}>Remove</Button>
                    {/if}
                </TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>

<form class="mt-6 grid gap-4 md:grid-cols-5 items-end" on:submit|preventDefault={addUser}>
    <div>
        <Label for="newUserEmail" class="mb-2">Email</Label>
        <Input id="newUserEmail" type="email" bind:value={email} required />
    </div>
    <div>
        <Label for="newUserName" class="mb-2">Name</Label>
        <Input id="newUserName" type="text" bind:value={name} placeholder="Defaults to email" />
    </div>
    <div>
        <Label for="newUserPassword" class="mb-2">Password</Label>
        <Input id="newUserPassword" type="password" bind:value={password} minlength={MIN_PASSWORD_LENGTH} autocomplete="new-password" required />
    </div>
    <div>
        <Label for="newUserRole" class="mb-2">Role</Label>
        <Select id="newUserRole" items={roleItems} bind:value={role} />
    </div>
    <Button type="submit" disabled={busy}>Add user</Button>
</form>
