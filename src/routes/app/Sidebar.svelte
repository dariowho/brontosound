<script lang="ts">
    import { page } from '$app/stores';
    import { Sidebar, SidebarWrapper, SidebarBrand, SidebarItem, SidebarGroup } from 'flowbite-svelte';
    import { Fa } from "svelte-fa";
  
    import { faMusic, faUsers, faHeartPulse, faChartLine, faGears, faArrowRightFromBracket, faDrum } from '@fortawesome/free-solid-svg-icons'
    import { faNewspaper, faFileLines } from '@fortawesome/free-regular-svg-icons'
    
    let spanClass = 'flex-1 ml-3 whitespace-nowrap';
  
    let site = {
      name: 'Brontosound',
      href: '/app',
      img: '/brontosaurus.webp'
    };
  
    let activeUrl: string;
    $: activeUrl = $page.url.pathname;

    $: containPath = ( asd: any )=>{
        console.log('containPath', asd);
        true
    }

    // logout form
    let form: HTMLFormElement;
  </script>

<div id="sidebar">
    
    <Sidebar asideClass="min-h-screen w-80">
        <SidebarWrapper class="min-h-screen">
        <SidebarGroup>
            <!-- <SidebarBrand {site} /> -->
            <SidebarItem label="Dashboard" href="/app" active={activeUrl === '/app'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faChartLine} /></span>
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="Songbook" {spanClass} href="/app/songbook" active={activeUrl === '/app/songbook'}>
            <svelte:fragment slot="icon">
                <span class="sidebarIcon"><Fa icon={faMusic} /></span>
            </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="Rehearsal" {spanClass} active={activeUrl === '/app/rehearsal'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faDrum} /></span>
                </svelte:fragment>
                <svelte:fragment slot="subtext">
                <span class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    soon!
                </span>
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="Press" {spanClass} active={activeUrl === '/app/press'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faNewspaper} /></span>
                </svelte:fragment>
                <svelte:fragment slot="subtext">
                <span class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    soon!
                </span>
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="Live" href="/app/live" {spanClass} active={activeUrl === '/app/live'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faHeartPulse} /></span>
                </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="Public site" {spanClass} active={activeUrl === '/app/site'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faFileLines} /></span>
                </svelte:fragment>
                <svelte:fragment slot="subtext">
                <span class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    soon!
                </span>
                </svelte:fragment>
            </SidebarItem>
        </SidebarGroup>
        <SidebarGroup border>
            <SidebarItem label="Settings" {spanClass} href="/app/settings" active={activeUrl === '/app/settings'}>
                <svelte:fragment slot="icon">
                    <span class="sidebarIcon"><Fa icon={faGears} /></span>
                </svelte:fragment>
            </SidebarItem>
            <form action="/login?/signOut" method="post" bind:this={form}>
                <SidebarItem label="Logout" {spanClass} on:click={() => form.requestSubmit()}>
                    <svelte:fragment slot="icon">
                        <span class="sidebarIcon"><Fa icon={faArrowRightFromBracket} /></span>
                    </svelte:fragment>
                </SidebarItem>
            </form>
        </SidebarGroup>
        </SidebarWrapper>
    </Sidebar>
</div>

<style>
    .sidebarIcon {
        font-size: 24px;
    }

    #sidebar {
        min-height: 100%;
        float: left;
        margin-right: 1em;
    }
</style>