<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signUp, signIn } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import {
    createAccountSchema,
    type CreateAccountData,
  } from "$lib/domain/auth/schema/auth";
  import type { Snippet } from "svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { goto } from "$app/navigation";
  import { clientAuthConfig } from "../../client.conf";
  import ErrorBanner from "$lib/domain/+shared/ui/atoms/ErrorBanner.svelte";
  import { errorToMessage } from "$lib/domain/auth/ui/utils/errorToMessage";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import PasswordStrengthMeter from "$lib/domain/auth/ui/atoms/PasswordStrengthMeter.svelte";

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
    nextPath: nextPath = clientAuthConfig.onLoginPath,
  }: Props = $props();

  const clientAdapter: any = zodClient(createAccountSchema as any) as any;
  const data: any = defaults(
    {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    } as any,
    clientAdapter,
  );

  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let isLoading = $state(false);
  const form = superForm<CreateAccountData>(data, {
    dataType: "json",
    SPA: true,
    resetForm: false,
    validators: clientAdapter,
  });
  const { form: formData } = form;

  function onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isLoading) return; // guard double submit
    isLoading = true;
    // Use the latest form data from the superform store
    handleSubmit($formData).finally(() => {
      isLoading = false;
    });
  }

  let errorMsg = $state("");

  async function handleSubmit(data: CreateAccountData) {
    const { name, email, password } = data;
    errorMsg = "";
    try {
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
      if (onSuccess) {
        onSuccess();
      } else {
        await goto(nextPath);
      }
    } catch (e: any) {
      errorMsg = errorToMessage("create", e);
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if title}
  {@render title()}
{:else}
  <h1 class="text-xl font-semibold mb-4">{m.login_link_create_account()}</h1>
{/if}

<form onsubmit={onFormSubmit} class="grid gap-3 max-w-sm">
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.create_label_name()}</Form.Label>
        <Input
          {...props}
          bind:value={$formData.name}
          autocomplete="name"
          disabled={isLoading}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.login_label_email()}</Form.Label>
        <Input
          {...props}
          type="email"
          placeholder={m.login_placeholder_email()}
          autocomplete="email"
          bind:value={$formData.email}
          disabled={isLoading}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.login_label_password()}</Form.Label>
        <div class="relative">
          <Input
            {...props}
            type={showPassword ? "text" : "password"}
            autocomplete="new-password"
            bind:value={$formData.password}
            minlength={8}
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
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <!-- Password Strength Meter -->
  <div class="mt-2">
    <PasswordStrengthMeter password={$formData.password || ""} />
  </div>

  <Form.Field {form} name="confirmPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.create_label_confirm_password()}</Form.Label>
        <div class="relative">
          <Input
            {...props}
            type={showConfirmPassword ? "text" : "password"}
            autocomplete="new-password"
            bind:value={$formData.confirmPassword}
            minlength={8}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onclick={() => (showConfirmPassword = !showConfirmPassword)}
            disabled={isLoading}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {#if showConfirmPassword}
              <EyeOffIcon class="h-4 w-4" />
            {:else}
              <EyeIcon class="h-4 w-4" />
            {/if}
          </Button>
        </div>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="agree">
    <Form.Control>
      {#snippet children({ props })}
        <label class="flex items-start gap-2 text-sm">
          <input
            {...props}
            type="checkbox"
            bind:checked={$formData.agree}
            disabled={isLoading}
            required
          />
          <span>
            {m.create_agree_prefix()}
            <a href="/pages/privacy-policy" class="underline"
              >{m.create_agree_privacy()}</a
            >
            {m.create_agree_and()}
            <a href="/pages/terms-of-service" class="underline"
              >{m.create_agree_terms()}</a
            >.
          </span>
        </label>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <ErrorBanner message={errorMsg} />

  <Button
    type="submit"
    class="mt-3 w-full"
    disabled={isLoading}
    aria-busy={isLoading}
  >
    {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
    {#if !isLoading}{m.login_link_create_account()}{/if}
  </Button>

  {#if footer}
    {@render footer()}
  {:else}
    <div class="flex gap-2 mt-2">
      <a href="/auth/login" class="text-sm underline">{m.auth_go_to_login()}</a>
    </div>
  {/if}
</form>
