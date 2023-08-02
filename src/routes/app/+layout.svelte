<script>
    import { Footer, FooterCopyright, FooterLinkGroup, FooterLink, Heading, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte'
    import Sidebar from "./Sidebar.svelte";
    import { page } from '$app/stores';
</script>

<Sidebar />

<section id="content">
    {#if $page.data.breadcrumb && $page.data.breadcrumb.length > 0 }
        <div id="breadcrumb">
            <Breadcrumb aria-label="Default breadcrumb example">
                <BreadcrumbItem href="/app" home>Home</BreadcrumbItem>
                {#each $page.data.breadcrumb.slice(0, $page.data.breadcrumb.length-1) as item}
                    <BreadcrumbItem href={item.href || null}>{item.title}</BreadcrumbItem>
                {/each}
                <BreadcrumbItem>{$page.data.breadcrumb[$page.data.breadcrumb.length-1].title}</BreadcrumbItem>
            </Breadcrumb>
        </div>
    {/if}
    
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
        min-height: calc( 100vh - 69px ); /* more or less the footer... */
    }

    #breadcrumb {
        margin-bottom: 1em;
    }

    #footerContainer {
        /* position: absolute; */
        /* bottom: 0; */
        width: 100%;
    }
</style>
