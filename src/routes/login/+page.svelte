<script lang="ts">
    import { Button, Heading, Toast } from "flowbite-svelte";
    import type { ActionData } from "./$types.js";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    export let data;
    export let form: ActionData;
    let formData = form;

    console.log("page data: ", data);
    console.log("form data: ", formData);

    if (browser) {
        if (formData?.signedIn) goto('/app');
        if (formData?.signedOut) goto('/');
    }
</script>

<div class="text-center">
    <div class="header">
        <Heading tag="h1">Login</Heading>
    </div>
    
    <!-- <p>This is the login page</p> -->

    <form action="?/signIn" method="post">
        <Button type="submit">Fake Sign In</Button>
    </form>
    
    <div id="messages">
        {#if formData?.signedIn}
            <Toast contentClass="w-full text-sm font-normal flex items-center justify-between" style="display:inline-flex">You have been successfully signed in!</Toast>
        {/if}
        {#if formData?.signedOut}
            <Toast contentClass="w-full text-sm font-normal flex items-center justify-between" style="display:inline-flex">You have been successfully signed out</Toast>
        {/if}
    </div>
</div>


<style>
    #messages {
        text-align: center;
        margin:1em;
    }

    .header {
        margin:2em;
    }
</style>