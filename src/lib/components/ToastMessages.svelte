<script lang="ts">
    import { Toast } from "flowbite-svelte";
    export let form;

    //   import type { ActionData } from "./$types.js";
    //   export let form: ActionData;

</script>

<div class="messages">
    {#if form?.success}
        <Toast
            color="green"
            contentClass="w-full text-sm font-normal flex items-center justify-between"
            style="display:inline-flex"
        >
            <svelte:fragment slot="icon">
                <svg
                    aria-hidden="true"
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                    ></path></svg
                >
                <span class="sr-only">Check icon</span>
            </svelte:fragment>
            Saved!
        </Toast>
    {/if}
</div>

<style>
    .messages {
        text-align: center;
        padding: 1em;
    }
</style>
