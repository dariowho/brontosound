<script>
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Avatar } from 'flowbite-svelte'

  import "../app.postcss";
  import { page } from '$app/state';

  // console.log(page.data)
</script>


<Navbar let:hidden let:toggle rounded color="form">
  <NavBrand href="/">
    <img
      src="/brontosaurus.webp"
      class="mr-3 h-6 sm:h-9"
      alt="Brontosound"
    />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
      Brontosound
    </span>
  </NavBrand>
  <div class="flex md:order-2">
    {#if page.data.brontoSession}
      <Avatar href="/signin" size="sm" src={page.data.brontoSession.auth?.user.image} />
    {:else}
      <Button size="sm" href="/signin">Sign in</Button>
    {/if}
    <NavHamburger on:click={toggle} />
  </div>
  <!-- <NavUl {hidden} class="order-1">
    <NavLi href="/" active={true}>Home</NavLi>
    <NavLi href="/about" active={false}>About</NavLi>
    <NavLi href="/services" active={false}>Songs</NavLi>
    <NavLi href="/pricing" active={false}>Events</NavLi>
    <NavLi href="/contact" active={false}>Shop</NavLi>
  </NavUl> -->
</Navbar>

<slot />
