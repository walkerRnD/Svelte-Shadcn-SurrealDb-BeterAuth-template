<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { forgetPassword } from "$lib/domain/api/api-client";
  import { z } from "zod";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import type { Snippet } from "svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { goto } from "$app/navigation";
  import ErrorBanner from "$lib/domain/+shared/ui/atoms/ErrorBanner.svelte";
  import { errorToMessage } from "$lib/domain/auth/ui/utils/errorToMessage";
  import LoaderIcon from "@lucide/svelte/icons/loader";

  // 📌 declare types separately
  type Props = {
    token?: string | null;
    onSuccess?: () => void;
    title?: Snippet<[]>;
    footer?: Snippet<[]>;
  };

  // 📌 apply types to object. DON'T apply on function like $props<Props>()
  let { token = $bindable(null), onSuccess, title, footer }: Props = $props();

  const schema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    confirm: z.string().min(8).optional(),
  });
  const clientAdapter: any = zodClient(schema as any) as any;
  const data: any = defaults(
    { email: "", password: "", confirm: "" } as any,
    clientAdapter,
  );

  let infoMsg = $state("");
  let errorMsg = $state("");
  let isLoading = $state(false);

  // Detect token from query (?token=...) if not provided as prop
  $effect(() => {
    if (token === null && typeof window !== "undefined") {
      const u = new URL(window.location.href);
      token = u.searchParams.get("token");
    }
  });

  const form = superForm<any>(data, {
    dataType: "json",
    SPA: true,
    resetForm: false,
    validators: clientAdapter,
  });
  const { form: formData, enhance } = form;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isLoading) return; // guard double submit
    infoMsg = "";
    errorMsg = "";
    isLoading = true;
    try {
      await forgetPassword({ email: String($formData.email || "") });
      infoMsg = m.reset_info_link_sent();
    } catch (e: any) {
      errorMsg = errorToMessage("resetStart", e);
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  async function handleReset(event: SubmitEvent) {
    event.preventDefault();
    if (isLoading) return; // guard double submit
    infoMsg = "";
    errorMsg = "";
    isLoading = true;
    try {
      const pw = String($formData.password || "");
      const confirm = String($formData.confirm || "");
      if (pw.length < 8) throw new Error(m.reset_error_pw_min_length());
      if (pw !== confirm) throw new Error(m.reset_error_pw_mismatch());
      if (!token) throw new Error(m.reset_error_missing_token());
      const { resetPassword } = await import("$lib/domain/api/api-client");
      await resetPassword({
        token,
        newPassword: pw,
        fetchOptions: {
          onError: (ctx) => {
            // Handle error without redirect
            throw new Error(ctx.error?.message || m.reset_error_failed());
          },
          onSuccess: () => {
            infoMsg = m.reset_info_reset_ok_redirect();
            if (onSuccess) {
              onSuccess();
            } else {
              goto("/auth/login");
            }
          },
        },
      });
    } catch (e: any) {
      errorMsg = errorToMessage("reset", e);
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if title}
  {@render title()}
{:else}
  <h1 class="text-xl font-semibold mb-4">{m.login_link_reset_password()}</h1>
{/if}

{#if token}
  <form use:enhance onsubmit={handleReset} class="grid gap-3 max-w-sm">
    <Form.Field {form} name="password">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>{m.reset_label_new_password()}</Form.Label>
          <Input
            {...props}
            type="password"
            autocomplete="new-password"
            bind:value={$formData.password}
            required
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="confirm">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>{m.reset_label_confirm_password()}</Form.Label>
          <Input
            {...props}
            type="password"
            autocomplete="new-password"
            bind:value={$formData.confirm}
            required
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    {#if infoMsg}<ErrorBanner message={infoMsg} variant="info" />{/if}
    <ErrorBanner message={errorMsg} />

    <div class="flex gap-2">
      <Button type="submit" disabled={isLoading}>
        {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
        {#if !isLoading}{m.login_link_reset_password()}{/if}
      </Button>
      {#if footer}
        {@render footer()}
      {:else}
        <a href="/auth/login" class="text-sm underline"
          >{m.auth_go_to_login()}</a
        >
      {/if}
    </div>
  </form>
{:else}
  <form use:enhance onsubmit={handleSubmit} class="grid gap-3 max-w-sm">
    <Form.Field {form} name="email">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>{m.login_label_email()}</Form.Label>
          <Input
            {...props}
            type="email"
            autocomplete="email"
            bind:value={$formData.email}
            disabled={isLoading}
            required
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    {#if infoMsg}<ErrorBanner message={infoMsg} variant="info" />{/if}
    <ErrorBanner message={errorMsg} />

    <div class="flex gap-2">
      <Button type="submit" disabled={isLoading}>
        {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
        {#if !isLoading}{m.reset_send_link()}{/if}
      </Button>
      {#if footer}
        {@render footer()}
      {:else}
        <a href="/auth/login" class="text-sm underline"
          >{m.auth_go_to_login()}</a
        >
      {/if}
    </div>
  </form>
{/if}
