<script lang="ts">
  import { FireOutline, StoreOutline, TableColumnOutline } from 'flowbite-svelte-icons';
  import SectionCard from '$lib/components/SectionCard.svelte';

  let { data } = $props();
  const plural = (count: number, noun: string) => `${count} ${noun}${count == 1 ? '' : 's'}`;
</script>

<p class="-mt-2 mb-8 text-gray-600">Where you play, when you play, and how you got the gig.</p>

<div class="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
  <SectionCard title="Venues" icon={StoreOutline} href="/app/live/venues" action="Manage venues"
    description="Build your catalog of venues where you had, or would like to have, a gig one day."
    footer={plural(data.venueCount, 'venue')} />
  <SectionCard title="Gigs" icon={FireOutline}
    description="Here you will find your past and planned gigs."
    footer="Gigs are listed on each venue for now" />
  <SectionCard title="Gig pursuit" icon={TableColumnOutline} href="/app/live/pursuit" action="Go get 'em"
    description="Keep track of your interactions with venues and win that gig!"
    footer={plural(data.pursuitCount, 'gig') + ' in pursuit'} />
</div>
