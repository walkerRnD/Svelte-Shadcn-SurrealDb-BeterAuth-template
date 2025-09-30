<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { signIn, signUp } from "../../../api/api-client";
  import { clientAuthConfig } from "../../client.conf";
  import { m } from "$lib/paraglide/messages.js";
  import ErrorBanner from "$lib/domain/+shared/ui/atoms/ErrorBanner.svelte";
  import { errorToMessage } from "$lib/domain/auth/ui/utils/errorToMessage";

  const devLoginEnabled =
    import.meta.env.MODE !== "production" ||
    import.meta.env.VITE_DEV_LOGIN === "true";

  type Props = {
    onSuccess?: () => void;
    nextPath?: string;
  };
  const {
    onSuccess,
    nextPath: nextPath = clientAuthConfig.onLoginPath,
  }: Props = $props();

  let isLoading = $state(false);
  let errorMsg = $state("");
  async function handleDevLogin() {
    isLoading = true;
    errorMsg = "";
    const email = "dev+e2e@example.com";
    const password = "password1234";
    const name = "Dev User";

    try {
      // Try sign-in first
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
      } catch (_) {
        // If sign-in fails, try sign-up then sign-in
        await signUp.email({
          name,
          email,
          password,
          fetchOptions: {
            onError: (ctx) => {
              throw new Error(ctx.error?.message || "Sign up failed");
            },
          },
        });
        await signIn.email({
          email,
          password,
          fetchOptions: {
            onError: (ctx) => {
              throw new Error(ctx.error?.message || "Sign in failed");
            },
          },
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        await goto(nextPath);
      }
    } catch (e: any) {
      errorMsg = errorToMessage("devLogin", e);
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if devLoginEnabled}
  <div class="grid gap-2 max-w-sm">
    <Button onclick={handleDevLogin} disabled={isLoading}
      >{m.login_dev_login()}</Button
    >
    <ErrorBanner message={errorMsg} />
  </div>
{/if}
