<script lang="ts">
    import type { LiveGig } from "$lib/dbEntities/live";
    import { buildGigUrl, buildVenueUrl } from "$lib/misc";
    import { Button, Card, Heading } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";

    export let columnName: string;
    export let gigs: LiveGig[]
</script>

<div class="column rounded-md">
    <Heading tag="h3" class="bg-gray-100 p-3 rounded-md">{columnName}</Heading>

    <div class="cards p-3 flex flex-col gap-3 items-center">
        {#each gigs as gig}
            <Card>
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words"><a href={buildVenueUrl(gig.venue)}>{gig.venue.name}</a></h5>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight break-words"><a href={buildGigUrl(gig, gig.venue)}>{gig.name}</a></p>
                <!-- <Button class="w-fit">
                    Details <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
                </Button> -->
            </Card>
        {/each}
    </div>
</div>

<style>
    .column {
        border: 1px solid lightgray;
    }
</style>