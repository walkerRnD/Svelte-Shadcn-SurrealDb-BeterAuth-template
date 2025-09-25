<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signIn, signUp } from "$lib/domain/api/api-client";

  let email = $state("");
  let password = $state("");
  let isLoading = $state(false);

  let errorMsg = $state("");
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = "";
    isLoading = true;
    try {
      await signIn.email({
        email: email,
        password: password,
      });
      history.back();
    } catch (e: any) {
      errorMsg = e?.message || "Failed to sign in";
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  const devLoginEnabled = true; // Always show in development/test
  async function handleDevLogin() {
    isLoading = true;
    errorMsg = "";
    const email = "dev+e2e@example.com";
    const password = "password1234";
    try {
      // try sign in; if fails, sign up then sign in
      await signIn.email({ email, password });
    } catch (_) {
      try {
        await signUp.email({ email, password, name: "Dev User" });
        await signIn.email({ email, password });
      } catch (e: any) {
        errorMsg = e?.message || "Dev Login failed";
      }
    } finally {
      isLoading = false;
    }
    if (!errorMsg) history.back();
  }
</script>

<h1 class="text-xl font-semibold mb-4">Login</h1>
<form onsubmit={handleSubmit} class="grid gap-3 max-w-sm">
  <div>
    <label for="email" class="text-sm font-medium">Email</label>
    <Input
      id="email"
      type="email"
      placeholder="example@test.com"
      autocomplete="email"
      bind:value={email}
      required
    />
  </div>

  <div>
    <label for="password" class="text-sm font-medium">Password</label>
    <Input
      id="password"
      type="password"
      autocomplete="current-password"
      bind:value={password}
      required
    />
  </div>

  {#if errorMsg}
    <p class="text-sm text-red-600">{errorMsg}</p>
  {/if}

  <Button type="submit" class="mt-3 w-full" disabled={isLoading}>Sign in</Button
  >
  {#if devLoginEnabled}
    <Button
      variant="secondary"
      class="mt-2 w-full"
      disabled={isLoading}
      onclick={handleDevLogin}
    >
      Dev Login
    </Button>
  {/if}
  <div class="flex gap-2 mt-2">
    <a href="/auth/create-account" class="text-sm underline">Create account</a>
    <a href="/auth/reset-password" class="text-sm underline">Reset password</a>
  </div>
</form>
