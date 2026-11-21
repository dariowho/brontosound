<script>
  import { Card, Avatar, Button, Alert, Input, Label } from 'flowbite-svelte';
  import { page } from "$app/state"
  import SignIn from './SignIn.svelte';
  import SignOut from './SignOut.svelte';
  import BrontoHeader from '../BrontoHeader.svelte';

  // `error` is set by Auth.js when it redirects back here (see `pages` in src/auth.ts)
  /** @type {Record<string, string>} */
  const authErrors = {
    AccessDenied: "This Google account is not registered. Ask a band admin to add your email.",
  };
  // The password was right; two-step verification asks for the code too (the form keeps email and password)
  let asksCode = $derived(['two_step_required', 'two_step_invalid'].includes(page.form?.credentialsError));
  let infoMessage = $derived(
    page.form?.credentialsError === 'two_step_required' ? "Enter the 6-digit code from your authenticator app."
    : page.url.searchParams.has('twoStepOn') ? "Two-step verification is on. Sign in with your password and a code."
    : page.url.searchParams.has('passwordChanged') ? "Password changed. Sign in with your new password."
    : null
  );
  let errorMessage = $derived(
    page.form?.credentialsError === 'too_many_attempts' ? "Too many attempts. Try again in 15 minutes."
    : page.form?.credentialsError === 'slow_down' ? "Too many failed attempts for this account. Wait a minute and try again."
    : page.form?.credentialsError === 'two_step_invalid' ? "Wrong code. Enter the one your app shows now."
    : page.form?.credentialsError && !asksCode ? "Invalid credentials."
    : page.url.searchParams.has('error') ? (authErrors[page.url.searchParams.get('error') ?? ''] ?? "Sign-in failed.")
    : null
  );
</script>
  
<BrontoHeader />

<main class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 pb-28 pt-12">
  {#if page.data.brontoSession}
    <div>
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
                    <SignOut options={{ redirectTo: '/signin' }}>Sign out</SignOut>
                </div>
            </div>
          </Card>
    </div>
  {:else}
    <!-- <span class="notSignedInText">You are not signed in</span> -->
    <div class="w-full max-w-sm">
      {#if errorMessage}
        <Alert color="red" class="mb-4">{errorMessage}</Alert>
      {:else if infoMessage}
        <Alert color="green" class="mb-4">{infoMessage}</Alert>
      {/if}
      <SignIn provider="credentials" options={{ redirectTo: '/app' }} className="flex flex-col gap-4">
        <svelte:fragment slot="credentials">
          <div>
            <Label for="signInEmail" class="mb-2">Email or username</Label>
            <Input id="signInEmail" name="email" type="text" autocomplete="username" required />
          </div>
          <div>
            <Label for="signInPassword" class="mb-2">Password</Label>
            <Input id="signInPassword" name="password" type="password" autocomplete="current-password" required />
          </div>
          {#if asksCode}
            <div>
              <Label for="signInCode" class="mb-2">Code</Label>
              <Input id="signInCode" name="code" inputmode="numeric" autocomplete="one-time-code" pattern={"[0-9]{6}"} maxlength={6} required autofocus />
            </div>
          {/if}
        </svelte:fragment>
        <span slot="submitButton">Sign in</span>
      </SignIn>
      <p class="my-4 text-center text-sm text-gray-500">or</p>
      <SignIn provider="google" options={{ redirectTo: '/app' }} className="flex flex-col"><span slot="submitButton">Sign in with Google</span></SignIn>
    </div>
  {/if}
</main>
