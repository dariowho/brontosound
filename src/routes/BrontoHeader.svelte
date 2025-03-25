<script lang="ts">
  import { Button, Avatar, NavHamburger } from 'flowbite-svelte'

  import { page } from '$app/state';
    import Fa from 'svelte-fa';
    import { faBars } from '@fortawesome/free-solid-svg-icons';

  export let solid: boolean = true;
  export let isMobile: boolean;
  export let sidebarComponent = null;

</script>


<div class="header {solid ? 'headerSolid' : ''}">
  {#if (isMobile && sidebarComponent)}
    <div class="hamburger">
      <Button on:click={sidebarComponent.toggleDrawer} color="light">
        <Fa icon={faBars} on:click={sidebarComponent.toggleDrawer}/>
      </Button>
    </div>
  {/if}
  <div class="siteName">
    <a href="/">
      <img
        src={page.data.bandLogo}
        class="mr-3 h-6 sm:h-9"
        alt="Brontosound"
      />
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
        {page.data.bandName}
      </span>
    </a>
  </div>
  <div class="flex md:order-2">
    {#if page.data.brontoSession}
      <Avatar href="/signin" size="sm" src={page.data.brontoSession.auth?.user.image} />
    {:else}
      <Button size="sm" href="/signin">Sign in</Button>
    {/if}
  </div>
</div>

<slot />

<style>
  .header {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    /* background-color: #dedede; */
  }

  .headerSolid {
    background-color: #00000020;
  }

  .hamburger {
    padding-right: 1em;
    display: block;
    align-self: center;
  }

  .siteName {
    display: flex;
    flex-grow: 1;
  }

  .siteName a {
    display: inline-flex;
    align-items: center;
  }
</style>