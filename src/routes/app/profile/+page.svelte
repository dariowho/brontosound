<script lang="ts">
    import { enhance } from "$app/forms";
    import { Alert, Button, Heading, Input, Label, P } from "flowbite-svelte";
    import SignOut from "../../signin/SignOut.svelte";
    import BacklineLinks from "./BacklineLinks.svelte";
    import TwoStepSettings from "./TwoStepSettings.svelte";
    import type { ActionData, PageData } from "./$types";
    import { MIN_PASSWORD_LENGTH } from "$lib/passwordPolicy";

    export let data: PageData;
    export let form: ActionData;
</script>

<div class="max-w-lg space-y-10">
    <P class="text-gray-500">Signed in as {data.profile.login} ({data.profile.role})</P>

    <section>
        <Heading tag="h2" class="mb-4 text-xl">Display name</Heading>
        <form method="POST" action="?/updateName" class="space-y-4" use:enhance={() => async ({ update }) => update({ reset: false })}>
            {#if form?.nameError}
                <Alert color="red">{form.nameError}</Alert>
            {:else if form?.nameSaved}
                <Alert color="green">Saved.</Alert>
            {/if}
            <Input id="profileName" name="name" value={data.profile.name} maxlength={100} required />
            <Button type="submit">Save</Button>
        </form>
    </section>

    <section>
        <Heading tag="h2" class="mb-4 text-xl">Password</Heading>
        {#if data.profile.isDefaultAdmin}
            <P>This account's password is set in <code>bandSettings.json</code> (<code>adminPasswordHash</code>).</P>
        {:else}
            <form method="POST" action="?/changePassword" class="space-y-4" use:enhance>
                {#if form?.passwordError}
                    <Alert color="red">{form.passwordError}</Alert>
                {/if}
                {#if data.profile.hasPassword}
                    <div>
                        <Label for="currentPassword" class="mb-2">Current password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" required />
                    </div>
                {/if}
                <div>
                    <Label for="newPassword" class="mb-2">New password</Label>
                    <Input id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength={MIN_PASSWORD_LENGTH} required />
                </div>
                <div>
                    <Label for="confirmPassword" class="mb-2">Repeat new password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength={MIN_PASSWORD_LENGTH} required />
                </div>
                <P class="text-sm text-gray-500">You will be signed out on all devices.</P>
                <Button type="submit">{data.profile.hasPassword ? 'Change password' : 'Set password'}</Button>
            </form>
        {/if}
    </section>

    <TwoStepSettings enabled={data.profile.twoStepEnabled} setup={data.twoStepSetup} hasPassword={data.profile.hasPassword} error={form?.twoStepError} />

    <BacklineLinks links={data.backlineLinks} />

    <div class="flex flex-wrap gap-3">
        <SignOut options={{ redirectTo: '/signin' }} />
        <form method="POST" action="?/signOutEverywhere">
            <Button color="light" type="submit">Sign out everywhere</Button>
        </form>
    </div>
</div>
