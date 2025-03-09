<script lang="ts">
    import { enhance } from "$app/forms"
    import type { signOut } from "@auth/sveltekit/client"
    import { Button } from "flowbite-svelte";
  
    export let className = ""
    export let options: Parameters<typeof signOut>[0] = undefined
    export let signOutPage = "signout"
  </script>
  
  <form
    method="POST"
    action={`/${signOutPage}`}
    use:enhance
    class={`signOutButton ${className}`}
    {...$$restProps}
  >
    {#if options}
      {#if options?.redirect}
        <input type="hidden" name="redirect" value={options.redirect} />
      {/if}
      {#if options?.redirectTo}
        <input type="hidden" name="redirectTo" value={options.redirectTo} />
      {/if}
    {/if}
    <Button color="light" type="submit">
      <slot name="submitButton">Sign Out</slot>
    </Button>
  </form>
  