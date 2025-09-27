<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signIn } from "$lib/domain/api/api-client";
  import type { Snippet } from "svelte";

  // 📌 declare types separately
  type Props = {
    onSuccess?: () => void;
    showDevLogin?: boolean;
    title?: Snippet<[]>;
    footer?: Snippet<[]>;
  };

  // 📌 apply types to object. DON'T apply on function like $props<Props>()
  let {
    onSuccess,
    showDevLogin = true,
    title,
    footer
  }: Props = $props();

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
      if (onSuccess) {
        onSuccess();
      } else {
        history.back();
      }
    } catch (e: any) {
      errorMsg = e?.message || "Failed to sign in";
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  async function handleDevLogin() {
    isLoading = true;
    errorMsg = "";
    try {
      // Use server-side dev-login to ensure cookies are set in the browser (E2E friendly)
      const res = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      // Small delay to ensure cookies are committed before navigating
      await new Promise((r) => setTimeout(r, 50));
      // Navigate to profile after successful session
      if (typeof window !== "undefined") window.location.href = "/user/profile";
    } catch (e: any) {
      errorMsg = e?.message || "Dev Login failed";
    } finally {
      isLoading = false;
    }
  }
</script>

{#if title}
  {@render title()}
{:else}
  <h1 class="text-xl font-semibold mb-4">Login</h1>
{/if}

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

  <Button type="submit" class="mt-3 w-full" disabled={isLoading}>Sign in</Button>
  
  {#if showDevLogin}
    <Button
      variant="secondary"
      class="mt-2 w-full"
      disabled={isLoading}
      onclick={handleDevLogin}
    >
      Dev Login
    </Button>
  {/if}

  {#if footer}
    {@render footer()}
  {:else}
    <div class="flex gap-2 mt-2">
      <a href="/auth/create-account" class="text-sm underline">Create account</a>
      <a href="/auth/reset-password" class="text-sm underline">Reset password</a>
    </div>
  {/if}
</form>
