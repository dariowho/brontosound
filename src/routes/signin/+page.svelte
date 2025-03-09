<script>
    import { Card, Avatar, Button } from 'flowbite-svelte';
    import { page } from "$app/state"
    import SignIn from './SignIn.svelte';
    import SignOut from './SignOut.svelte';
  </script>
   
  <div class='text-center items-center mt-3'>
    {#if page.data.brontoSession}
    <div style="display:inline-block">
        <Card padding="md">
            <div class="flex flex-col items-center pb-4">
                <p class="mb-3">You are signed in as</p>
                {#if page.data.brontoSession.auth.user?.image}
                    <Avatar size="lg" src={page.data.brontoSession.auth.user.image} />
                {/if}
                <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{page.data.brontoSession.user?.name ?? "User"}</h5>
                <!-- <span class="text-sm text-gray-500 dark:text-gray-400">Visual Designer</span> -->
                <div class="flex mt-4 space-x-3 rtl:space-x-reverse lg:mt-6">
                    <Button href="/app">Go to app</Button>
                    <SignOut>Sign out</SignOut>
                </div>
            </div>
          </Card>
    </div>
    {:else}
      <!-- <span class="notSignedInText">You are not signed in</span> -->
      <SignIn provider="google"><span slot="submitButton">Sign in with Google</span></SignIn>
    {/if}
  </div>