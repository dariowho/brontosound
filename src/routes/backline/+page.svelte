<script lang="ts">
    import { onMount, tick } from "svelte";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { Alert, Button, Heading, Input, P } from "flowbite-svelte";
    import { openMailbox } from "$lib/backline/mailbox";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    // The remote on screen. It stays while Backline is out of reach, because it may still reach Backline directly;
    // it goes when this visitor is no longer allowed in
    let page: string | null = null;
    $: if (data.page) {
        page = data.page;
    } else if (data.live) {
        page = null;
    }

    let pinForm: HTMLFormElement | undefined;
    let full = false; // all guest seats are taken: waiting for one
    let pin = '';

    // The remote runs in a sandboxed frame: it is Backline's code, kept away from this site's session. This page
    // only carries its messages to and from Backline. It finds a direct path to Backline by itself (WebRTC).
    function relay(frame: HTMLIFrameElement) {
        const toFrame = (text: string) => frame.contentWindow?.postMessage(text, '*');
        let seated = false;
        const mailbox = openMailbox('/backline/client', {
            opened() {
                full = false;
                toFrame('{"t":"open"}');
                // Seated again: Backline may have been replaced by another one, with another page
                if (seated) {
                    invalidateAll();
                }
                seated = true;
            },
            message: toFrame,
            refused: invalidateAll,
            full() {
                full = true;
            },
        });
        const fromFrame = (event: MessageEvent) => {
            if (event.source === frame.contentWindow && typeof event.data === 'string') {
                mailbox.send(event.data);
            }
        };
        window.addEventListener('message', fromFrame);
        return {
            destroy() {
                mailbox.close();
                window.removeEventListener('message', fromFrame);
            },
        };
    }

    onMount(() => {
        // Backline's QR code carries the PIN after the #
        if (data.asksPin && /^#\d+$/.test(location.hash)) {
            pin = location.hash.slice(1);
            tick().then(() => pinForm?.requestSubmit());
        }
        // Not in yet: look again every few seconds
        const waiting = setInterval(() => page || invalidateAll(), 5000);
        return () => clearInterval(waiting);
    });
</script>

<svelte:head>
    <title>Backline</title>
</svelte:head>

{#if page}
    <iframe use:relay srcdoc={page} sandbox="allow-scripts" allow="local-network-access" title="Backline"></iframe>
    {#if full}
        <p role="status" class="fixed inset-x-0 top-0 bg-gray-900 px-4 py-3 text-center text-sm text-white">The live session is full. Waiting for a free seat…</p>
    {/if}
{:else}
    <main class="mx-auto max-w-xs space-y-6 p-8 pt-24 text-center">
        <img src={data.bandLogo} alt="" class="mx-auto h-20" />
        <Heading tag="h1" class="text-2xl">{data.bandName}</Heading>
        {#if !data.live}
            <P class="text-gray-500">Nothing is live right now.</P>
        {:else if data.asksPin}
            <form method="POST" bind:this={pinForm} class="space-y-4" use:enhance>
                {#if form?.pinError}
                    <Alert color="red">{form.pinError}</Alert>
                {/if}
                <Input name="pin" bind:value={pin} inputmode="numeric" autocomplete="off" placeholder="PIN" class="text-center text-2xl tracking-widest" required />
                <Button type="submit" class="w-full">Join</Button>
            </form>
        {/if}
        {#if !data.brontoSession}
            <P><a href="/signin" class="text-primary-600 underline">Band member? Sign in</a></P>
        {/if}
    </main>
{/if}

<style>
    iframe {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
</style>
