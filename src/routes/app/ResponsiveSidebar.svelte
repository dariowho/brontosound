<script lang="ts">
	// import '../app.postcss';
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		DarkMode,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Drawer,
		CloseButton,
		SidebarDropdownWrapper,

        Button

	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
    import { faHeartPulse, faHome, faMusic } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	let breakPoint: number = 1024;
	let width: number;
	let backdrop: boolean = false;
	let activateClickOutside = true;
	let drawerHidden: boolean = false;
    export let isMobile;
    $: if (width >= breakPoint) { isMobile = false; } else { isMobile = true; }
	$: if (! isMobile ) {
		drawerHidden = false;
		activateClickOutside = false;
	} else {
		drawerHidden = true;
		activateClickOutside = true;
	}
	onMount(() => {
		if (! isMobile ) {
			drawerHidden = false;
			activateClickOutside = false;
		} else {
			drawerHidden = true;
			activateClickOutside = true;
		}
	});
	const toggleSide = () => {
		if (isMobile) {
			drawerHidden = !drawerHidden;
		}
	};
	export const toggleDrawer = () => {
		drawerHidden = false;
	};
	let spanClass = 'pl-2 self-center text-md text-gray-900 whitespace-nowrap dark:text-white';

    const fixedDrawerClass="relative float-left min-h-screen"
    const mobileDrawerClass="overflow-scroll pb-32"

    const menuItems = [
        {name: "Home", path: "/app", icon: faHome},
        {name: "Songbook", path: "/app/songbook", icon: faMusic},
        {name: "Live", path: "/app/live", icon: faHeartPulse},
    ]
</script>

<svelte:window bind:innerWidth={width} />

<Drawer
	transitionType="fly"
	{backdrop}
	{transitionParams}
	bind:hidden={drawerHidden}
	bind:activateClickOutside
	width="w-64"
	class={isMobile ? mobileDrawerClass : fixedDrawerClass}
	id="sidebar"
>
	<div class="flex items-center">
		<CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white lg:hidden" />
	</div>
	<Sidebar asideClass="w-54" activeUrl={page.route.id}>
		<SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800">
			<SidebarGroup>
				{#each menuItems as { name, path, icon }}
					<SidebarItem
						label={name}
						href={path}
						{spanClass}
						activeClass="flex items-center p-2 text-base font-normal text-gray-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-primary-700"
						on:click={toggleSide}
					>
                        <svelte:fragment slot="icon">
                            <span class="sidebarIcon"><Fa icon={icon} /></span>
                        </svelte:fragment>
                    </SidebarItem>
				{/each}
				<!-- <SidebarDropdownWrapper label="Articles">
					{#each data.articles as { meta, path }}
						<SidebarItem
							label={meta.title}
							href={`/blog/${path}`}
							{spanClass}
							activeClass="flex items-center p-2 text-base font-normal text-gray-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-primary-700"
							on:click={toggleSide}
							active={activeUrl === `/blog/${path}`}
						/>
					{/each}
				</SidebarDropdownWrapper> -->
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
</Drawer>
