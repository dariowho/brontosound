<script>
    import { Footer, FooterCopyright, FooterLinkGroup, FooterLink, Heading } from 'flowbite-svelte'
    import Sidebar from "./Sidebar.svelte";
    import { page } from '$app/stores';
</script>

<Sidebar />

<section id="content">
    <div class="header">
        <Heading tag="h1">{$page.data.pageTitle}</Heading>
    </div>
    <slot />
</section>

<div id="footerContainer">
<Footer >
    <FooterCopyright href="/" by="Brontosauri Dischi" year={2023} />
    <FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        <FooterLink href="/">About</FooterLink>
        <FooterLink href="/">Privacy Policy</FooterLink>
        <FooterLink href="/">Licensing</FooterLink>
        <FooterLink href="/">Contact</FooterLink>
    </FooterLinkGroup>
</Footer>
</div>

<style>
    .header {
        margin-bottom: 2em;
    }

    #content {
        padding: 1em;
        margin-left: 16rem;
    }

    #footerContainer {
        position: absolute;
        bottom: 0;
        width: 100%;
    }
</style>
