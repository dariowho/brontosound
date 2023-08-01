<script>
    import { faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button } from 'flowbite-svelte'
    import Fa from 'svelte-fa/src/fa.svelte';
</script>

<Navbar let:hidden let:toggle>
    <NavBrand href="/">
      <img
        src="/brontosaurus.webp"
        class="mr-3 h-6 sm:h-9"
        alt="Flowbite Logo"
      />
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
        Brontosound
      </span>
    </NavBrand>
    <div class="flex md:order-2">
      <Button size="sm" href="/login">Login</Button>
      <NavHamburger on:click={toggle} />
    </div>
    <NavUl {hidden} class="order-1">
      <NavLi href="/" active={true}>Home</NavLi>
      <NavLi href="/about" active={false}>About</NavLi>
      <NavLi href="/services" active={false}>Songs</NavLi>
      <NavLi href="/pricing" active={false}>Events</NavLi>
      <NavLi href="/contact" active={false}>Shop</NavLi>
    </NavUl>
  </Navbar>
    
  <Fa icon={faArrowAltCircleDown}></Fa>
<p style="text-align:center; padding:2em">This is the band's public website</p>
