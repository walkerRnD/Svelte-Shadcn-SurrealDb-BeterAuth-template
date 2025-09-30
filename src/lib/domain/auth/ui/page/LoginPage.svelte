<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signIn } from "$lib/domain/api/api-client";
  import DevLoginButton from "$lib/domain/auth/ui/atoms/DevLoginButton.svelte";
  import ErrorBanner from "$lib/domain/+shared/ui/atoms/ErrorBanner.svelte";
  import type { Snippet } from "svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { goto } from "$app/navigation";
  import { clientAuthConfig } from "../../client.conf";
  import { errorToMessage } from "$lib/domain/auth/ui/utils/errorToMessage";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import LoaderIcon from "@lucide/svelte/icons/loader";

  // 📌 declare types separately
  type Props = {
    onSuccess?: () => void;
    nextPath?: string;
    title?: Snippet<[]>;
    footer?: Snippet<[]>;
  };

  // 📌 apply types to object. DON'T apply on function like $props<Props>()
  let {
    onSuccess,
    title,
    footer,
    nextPath = clientAuthConfig.onLoginPath,
  }: Props = $props();

  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let isLoading = $state(false);
  let errorMsg = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isLoading) return; // guard double submit
    errorMsg = "";
    isLoading = true;
    try {
      await signIn.email({
        email,
        password,
        fetchOptions: {
          onError: (ctx) => {
            throw new Error(ctx.error?.message || "Sign in failed");
          },
        },
      });
      if (onSuccess) {
        onSuccess();
      } else {
        await goto(nextPath);
      }
    } catch (e: any) {
      errorMsg = errorToMessage("login", e);
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if title}
  {@render title()}
{:else}
  <h1 class="text-xl font-semibold mb-4">{m.login_title()}</h1>
{/if}

<form onsubmit={handleSubmit} class="grid gap-3 max-w-sm">
  <div>
    <label for="email" class="text-sm font-medium"
      >{m.login_label_email()}</label
    >
    <Input
      id="email"
      type="email"
      placeholder={m.login_placeholder_email()}
      autocomplete="email"
      bind:value={email}
      disabled={isLoading}
      required
    />
  </div>

  <div>
    <label for="password" class="text-sm font-medium"
      >{m.login_label_password()}</label
    >
    <div class="relative">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        autocomplete="current-password"
        bind:value={password}
        disabled={isLoading}
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        onclick={() => (showPassword = !showPassword)}
        disabled={isLoading}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {#if showPassword}
          <EyeOffIcon class="h-4 w-4" />
        {:else}
          <EyeIcon class="h-4 w-4" />
        {/if}
      </Button>
    </div>
  </div>

  <ErrorBanner message={errorMsg} />

  <Button
    type="submit"
    class="mt-3 w-full"
    disabled={isLoading}
    aria-busy={isLoading}
  >
    {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
    {#if !isLoading}{m.login_submit()}{/if}
  </Button>

  <DevLoginButton />

  {#if footer}
    {@render footer()}
  {:else}
    <div class="flex gap-2 mt-2">
      <a href="/auth/create-account" class="text-sm underline"
        >{m.login_link_create_account()}</a
      >
      <a href="/auth/reset-password" class="text-sm underline"
        >{m.login_link_reset_password()}</a
      >
    </div>
  {/if}
</form>
