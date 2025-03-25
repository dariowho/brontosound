<script>
    import { Card, Button } from 'flowbite-svelte';
    import { ArrowRightOutline, FireOutline, StoreOutline, TableColumnOutline } from 'flowbite-svelte-icons';
  </script>
  
<div class="grid md:grid-cols-3 gap-3">
    <Card size="lg" class="mb-5 mr-3">
        <StoreOutline class="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Venues</h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Build your catalog of venues where you had or would like to have a gig one day.</p>
        <Button href="/app/live/venues" class="w-fit">
          Manage Venues <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
        </Button>
      </Card>
    
      <Card size="lg" class="mb-5 mr-3">
        <FireOutline class="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gigs</h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Here you will find your past and planned gigs.</p>
        <Button class="w-fit" disabled>
          Browse Gigs<ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
        </Button>
      </Card>

      <Card size="lg" class="mb-5 mr-3">
        <TableColumnOutline class="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gig pursuit</h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Keep track of your interaction with venues and win that gig!</p>
        <Button class="w-fit" disabled>
          Go get 'em <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
        </Button>
      </Card>
</div>
