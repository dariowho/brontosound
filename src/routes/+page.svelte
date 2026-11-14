<script>
    import { page } from "$app/state";
    import BrontoHeader from "./BrontoHeader.svelte";
    import PoweredBy from "$lib/components/PoweredBy.svelte";
</script>

<BrontoHeader />

{#if page.data.staticContent}
<div class="staticContent">
    {@html page.data.staticContent}
</div>

{:else}
<div class="flex min-h-[calc(100vh-4rem)] flex-col">
    <main class="flex flex-1 items-center justify-center px-6 py-16">
        <div class="flex w-full max-w-xl flex-col items-center gap-8 text-center">
            <!-- outline of a future website -->
            <div aria-hidden="true" class="flex w-full max-w-md flex-col gap-3.5 rounded-xl border-[1.5px] border-dashed border-gray-300 p-5">
                <div class="flex items-center justify-between">
                    <span class="h-2.5 w-24 rounded-full bg-gray-200"></span>
                    <span class="flex gap-2">
                        <span class="h-2 w-9 rounded bg-gray-100"></span>
                        <span class="h-2 w-9 rounded bg-gray-100"></span>
                        <span class="h-2 w-9 rounded bg-gray-100"></span>
                    </span>
                </div>
                <div class="flex h-28 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200">
                        <svg viewBox="0 0 24 24" class="h-4 w-4 fill-primary-700"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                </div>
                <div class="grid grid-cols-3 gap-2.5">
                    <span class="h-11 rounded-md bg-gray-100"></span>
                    <span class="h-11 rounded-md bg-gray-100"></span>
                    <span class="h-11 rounded-md bg-gray-100"></span>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <h1 class="text-4xl font-bold tracking-tight text-gray-900">No website here yet</h1>
                <p class="text-lg text-gray-600">{page.data.bandName} hasn't published its public site yet. Check back soon.</p>
            </div>

            <div class="flex w-full flex-col items-center gap-1 border-t border-gray-200 pt-6 text-sm text-gray-500">
                <span>Are you in the band? <a href="/signin" class="font-medium text-primary-800 hover:text-primary-900">Sign in</a> to manage it.</span>
                <span>The site designer is coming soon to Brontosound.</span>
            </div>
        </div>
    </main>

    <footer class="flex justify-center border-t border-gray-200 px-6 py-5 text-sm text-gray-500">
        <PoweredBy />
    </footer>
</div>
{/if}
