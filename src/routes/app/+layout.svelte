<script lang="ts">
    import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte'
    import { page } from '$app/stores';
    import ResponsiveSidebar from './ResponsiveSidebar.svelte';
    import BrontoHeader from '../BrontoHeader.svelte';
    import PageTitle from '$lib/components/PageTitle.svelte';
    import PoweredBy from '$lib/components/PoweredBy.svelte';
    import versionInfo from '$lib/version.json';

    let isMobile: boolean;
    let sidebarComponent;
</script>

<BrontoHeader bind:isMobile bind:sidebarComponent />

<section id="content">
    <ResponsiveSidebar bind:isMobile bind:this={sidebarComponent} />

    {#if $page.data.breadcrumb && $page.data.breadcrumb.length > 0 }
        <div id="breadcrumb">
            <Breadcrumb aria-label="Breadcrumb">
                <BreadcrumbItem href="/app" home>Home</BreadcrumbItem>
                {#each $page.data.breadcrumb.slice(0, $page.data.breadcrumb.length-1) as item}
                    <BreadcrumbItem href={item.href || null}>{item.title}</BreadcrumbItem>
                {/each}
                <BreadcrumbItem>{$page.data.breadcrumb[$page.data.breadcrumb.length-1].title}</BreadcrumbItem>
            </Breadcrumb>
        </div>
    {/if}

    <div class="pageContent">
        <!-- Pages that need actions next to the title render their own PageTitle and omit `pageTitle` -->
        {#if $page.data.pageTitle}
            <PageTitle title={$page.data.pageTitle} />
        {/if}

        <slot />
    </div>
</section>

<footer class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-5 text-sm text-gray-500">
    <PoweredBy />
    <div class="flex flex-wrap items-center gap-6">
        <span title="Released on {versionInfo.releaseDate}">v{versionInfo.version}</span>
        <a href="/" class="hover:text-gray-700">About</a>
        <a href="/" class="hover:text-gray-700">Privacy Policy</a>
        <a href="/" class="hover:text-gray-700">Licensing</a>
        <a href="/" class="hover:text-gray-700">Contact</a>
    </div>
</footer>

<style>
    #content {
        display: flow-root; /* contains the floating sidebar */
        padding: 1.5rem 1.5rem 4rem;
        min-height: calc( 100vh - 4rem - 65px ); /* header and footer */
    }

    #breadcrumb {
        margin-bottom: 1rem;
        overflow: auto;
    }

    .pageContent {
        display: flow-root;
    }
</style>
