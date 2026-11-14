<script lang="ts">
  import { Button } from 'flowbite-svelte'
  import { page } from '$app/state';
  import Fa from 'svelte-fa';
  import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

  export let isMobile: boolean = false;
  export let sidebarComponent = null;
</script>


<header class="relative z-10 flex h-16 items-center justify-between gap-4 bg-charcoal px-6 shadow-header">
  <div class="flex items-center gap-3">
    {#if (isMobile && sidebarComponent)}
      <button type="button" class="text-white" aria-label="Open menu" on:click={sidebarComponent.toggleDrawer}>
        <Fa icon={faBars} />
      </button>
    {/if}
    <a href="/" class="inline-flex items-center gap-3 whitespace-nowrap text-xl font-medium text-white">
      <img src={page.data.bandLogo} class="h-9 w-9 invert" alt="" />
      {page.data.bandName}
    </a>
  </div>
  {#if page.data.brontoSession}
    <a href="/app/profile" aria-label="Your profile" class="flex h-9 w-9 items-end justify-center overflow-hidden rounded-full bg-charcoal-raised text-2xl text-stone-200">
      {#if page.data.brontoSession.auth?.user.image}
        <img src={page.data.brontoSession.auth.user.image} class="h-full w-full object-cover" alt="" />
      {:else}
        <Fa icon={faUser} />
      {/if}
    </a>
  {:else}
    <Button size="sm" href="/signin">Sign in</Button>
  {/if}
</header>

<slot />
