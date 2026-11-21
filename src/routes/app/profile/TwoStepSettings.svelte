<script lang="ts">
    import { enhance } from "$app/forms";
    import { Alert, Button, Heading, Input, Label, P } from "flowbite-svelte";

    /** Two-step verification for password sign-in: set up with an authenticator app, or turn off */
    let { enabled, setup, hasPassword, error }: {
        enabled: boolean,
        setup: { qr: string, secret: string } | null, // while being set up
        hasPassword: boolean, // two-step is for password sign-in
        error?: string,
    } = $props();
</script>

{#snippet codeField(id: string)}
    <div>
        <Label for={id} class="mb-2">Code</Label>
        <Input {id} name="code" inputmode="numeric" autocomplete="one-time-code" pattern={"[0-9]{6}"} maxlength={6} required class="w-32" />
    </div>
{/snippet}

<section>
    <Heading tag="h2" class="mb-4 text-xl">Two-step verification</Heading>
    {#if error}
        <Alert color="red" class="mb-4">{error}</Alert>
    {/if}
    {#if !hasPassword}
        <P class="text-sm text-gray-500">For password sign-in. Google sign-in uses Google's own.</P>
    {:else if enabled}
        <P class="mb-4 text-sm text-gray-500">On: signing in with your password also asks for a code from your authenticator app.</P>
        <form method="POST" action="?/turnOffTwoStep" class="flex items-end gap-3" use:enhance>
            {@render codeField('twoStepOffCode')}
            <Button type="submit" color="light">Turn off</Button>
        </form>
    {:else if setup}
        <P class="mb-4 text-sm text-gray-500">Scan this with an authenticator app (Google Authenticator, 1Password, Aegis…) or type in the key, then enter the code it shows. Turning it on signs you out everywhere.</P>
        <img src={setup.qr} alt="QR code for your authenticator app" width="180" height="180" class="mb-2" />
        <P class="mb-4 break-all font-mono text-sm">{setup.secret}</P>
        <div class="flex flex-wrap items-end gap-3">
            <form method="POST" action="?/confirmTwoStep" class="flex items-end gap-3" use:enhance>
                {@render codeField('twoStepOnCode')}
                <Button type="submit">Turn on</Button>
            </form>
            <form method="POST" action="?/turnOffTwoStep" use:enhance>
                <Button type="submit" color="alternative">Cancel</Button>
            </form>
        </div>
    {:else}
        <P class="mb-4 text-sm text-gray-500">Ask for a code from an authenticator app, besides your password, when you sign in.</P>
        <form method="POST" action="?/startTwoStep" use:enhance>
            <Button type="submit">Set up</Button>
        </form>
    {/if}
</section>
