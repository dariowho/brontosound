<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button, Heading, P } from "flowbite-svelte";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;
</script>

<svelte:head>
    <title>Link Backline</title>
</svelte:head>

<main class="mx-auto max-w-sm space-y-6 p-8 pt-24 text-center">
    <img src={data.bandLogo} alt="" class="mx-auto h-20" />
    <Heading tag="h1" class="text-2xl">Link Backline to {data.bandName}</Heading>
    {#if form?.linked}
        <P>Linked. Go back to Backline.</P>
    {:else if !data.brontoSession}
        <P><a href="/signin" class="text-primary-600 underline">Sign in</a>, then open this page again from Backline.</P>
    {:else}
        <P>Backline shows this code:</P>
        <P class="text-3xl font-bold tracking-widest">{data.code}</P>
        <P class="text-sm text-gray-500">It will share its Live page at /backline as {data.brontoSession.user.name}, replacing the one live now.</P>
        <P class="rounded-lg border border-primary-300 bg-primary-50 p-3 text-sm">Link only a Backline you just opened yourself and that shows this code. If someone sent you this page, don't.</P>
        <form method="POST" use:enhance>
            <Button type="submit" class="w-full">Link</Button>
        </form>
    {/if}
</main>
