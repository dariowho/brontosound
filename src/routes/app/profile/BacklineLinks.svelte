<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button, Heading, P } from "flowbite-svelte";

    export let links: { id: number, creationDate?: Date }[];
</script>

<section>
    <Heading tag="h2" class="mb-4 text-xl">Backline</Heading>
    <P class="mb-4 text-sm text-gray-500">
        A linked Backline shares its Live page at <a href="/backline" class="underline">/backline</a>.
        To link one, enter this site's address in Backline, under Settings → Sharing.
    </P>

    {#each links as link}
        <form method="POST" action="?/unlinkBackline" class="mb-2 flex items-center justify-between" use:enhance>
            <input type="hidden" name="id" value={link.id} />
            <span>Linked on {new Date(link.creationDate ?? 0).toLocaleDateString()}</span>
            <Button type="submit" color="light" size="xs">Unlink</Button>
        </form>
    {/each}
</section>
