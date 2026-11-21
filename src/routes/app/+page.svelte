<script lang="ts">
    import { faHeartPulse, faMusic } from '@fortawesome/free-solid-svg-icons';
    import StatPanel from '$lib/components/StatPanel.svelte';

    let { data } = $props();
    const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('it-IT') : '—';
</script>

<p class="mb-8 text-gray-700">Welcome back, <strong class="text-gray-900">{data.brontoSession?.user.name}</strong>!</p>

<div class="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
    <StatPanel title="Songbook" icon={faMusic} href="/app/songbook" stats={[
        { label: "Songs", value: data.songbook.songCount },
        { label: "Tags", value: data.songbook.tagCount },
        { label: "Last added", value: formatDate(data.songbook.lastAdded) },
    ]}>
        {#if data.songbook.newSongCount > 0}
            <a href="/app/songbook" class="flex items-center justify-between gap-3 rounded-lg border border-primary-300 bg-primary-50 px-4 py-3 text-sm text-gray-900">
                <span class="flex items-center gap-2.5">
                    <span class="h-2 w-2 rounded-full bg-primary-700"></span>
                    <span><strong>{data.songbook.newSongCount} new song{data.songbook.newSongCount == 1 ? '' : 's'}</strong> found in your storage</span>
                </span>
                <span class="font-medium text-primary-800">Review</span>
            </a>
        {/if}
    </StatPanel>

    <StatPanel title="Live" icon={faHeartPulse} href="/app/live" stats={[
        { label: "Venues", value: data.live.venueCount },
        { label: "Gigs in pursuit", value: data.live.pursuitCount },
        { label: "Upcoming gigs", value: data.live.upcomingGigCount },
    ]}>
        {#if data.live.nextGig}
            <a href={data.live.nextGig.url} class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900">
                <span>Next gig: <strong>{data.live.nextGig.venueName}</strong> · {formatDate(data.live.nextGig.date)}</span>
                <span class="font-medium text-primary-800">Details</span>
            </a>
        {/if}
    </StatPanel>
</div>
