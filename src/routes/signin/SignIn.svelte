<script lang="ts">
    /*
    Vendorized from https://github.com/nextauthjs/next-auth/blob/3d1e2150533bc467e81ae2221e0cb00cde01e8aa/packages/frameworks-sveltekit/src/lib/components/SignIn.svelte
    in order to replace the `Button` component with the `flowbite-svelte` version.
    */

    import { enhance } from "$app/forms"
    import { Button } from 'flowbite-svelte';
    import {signIn} from "@auth/sveltekit/client"

  
    export let className = ""
    // TODO: Lookup provider type by id
    export let provider: Partial<Parameters<typeof signIn>[0]> = ""
    /** The path to the FormAction file in your route. @default signin */
    export let signInPage = "signin"
    export let options: Parameters<typeof signIn>[1] | undefined = undefined
    export let authorizationParams: Parameters<typeof signIn>[2] | undefined =
      undefined
    const callbackUrl =
      options instanceof FormData
        ? options.get("redirectTo")
        : options?.redirectTo
    const redirect =
      options instanceof FormData ? options.get("redirect") : options?.redirectTo
    const redirectTo = callbackUrl
  
    const authorizationParamsInputs = authorizationParams
      ? typeof authorizationParams === "string" && authorizationParams
        ? new URLSearchParams(authorizationParams)
        : authorizationParams
      : undefined
  </script>
  
  <form
    method="POST"
    action={`/${signInPage}`}
    use:enhance
    class={`signInButton ${className}`}
    {...$$restProps}
  >
    <input type="hidden" name="providerId" value={provider} />
    {#if callbackUrl}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
    {/if}
    {#if redirect}
      <input type="hidden" name="redirect" value={redirect} />
    {/if}
    {#if redirectTo}
      <input type="hidden" name="redirectTo" value={redirectTo} />
    {/if}
    {#if authorizationParamsInputs}
      {#each Object.entries(authorizationParamsInputs) as [key, value]}
        <input type="hidden" name={`authorizationParams-${key}`} {value} />
      {/each}
    {/if}
    {#if provider === "credentials"}
      <slot name="credentials" />
    {/if}
    <!-- TODO: Filter by provider type only -->
    {#if provider === "email" || provider === "sendgrid" || provider === "resend"}
      <slot name="email">
        <label
          class="section-header"
          for={`input-email-for-${provider}-provider`}
        >
          Email
        </label>
        <input
          id="input-email-for-email-provider"
          type="email"
          name="email"
          placeholder="email@example.com"
          required
        />
      </slot>
    {/if}
    <Button type="submit">
      <slot name="submitButton">Signin{provider ? ` with ${provider}` : ""}</slot>
    </Button>
  </form>