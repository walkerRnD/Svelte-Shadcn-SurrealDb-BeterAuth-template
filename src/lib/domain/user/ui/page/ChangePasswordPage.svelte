<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { changePassword } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import { changePasswordSchema } from "$lib/domain/auth/schema/auth";
  import { m } from "$lib/paraglide/messages.js";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import PasswordStrengthMeter from "$lib/domain/auth/ui/atoms/PasswordStrengthMeter.svelte";

  const clientAdapter: any = zodClient(changePasswordSchema as any) as any;
  const data: any = defaults(
    { currentPassword: "", newPassword: "", confirmPassword: "" } as any,
    clientAdapter,
  );

  let infoMsg = $state("");
  let errorMsg = $state("");
  let isLoading = $state(false);
  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);

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
      await changePassword({
        currentPassword: String($formData.currentPassword || ""),
        newPassword: String($formData.newPassword || ""),
      });
      infoMsg = m.user_change_password_success();
      form.reset();
    } catch (e: any) {
      errorMsg = e?.message || m.user_change_password_error();
    } finally {
      isLoading = false;
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">{m.user_change_password_title()}</h1>
<form
  method="POST"
  use:enhance
  onsubmit={handleSubmit}
  class="grid gap-3 max-w-sm"
>
  <Form.Field {form} name="currentPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.user_change_password_current()}</Form.Label>
        <div class="relative">
          <Input
            {...props}
            type={showCurrentPassword ? "text" : "password"}
            autocomplete="current-password"
            bind:value={$formData.currentPassword}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onclick={() => (showCurrentPassword = !showCurrentPassword)}
            disabled={isLoading}
            aria-label={showCurrentPassword
              ? m.ui_hide_password()
              : m.ui_show_password()}
          >
            {#if showCurrentPassword}
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

  <Form.Field {form} name="newPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.user_change_password_new()}</Form.Label>
        <div class="relative">
          <Input
            {...props}
            type={showNewPassword ? "text" : "password"}
            autocomplete="new-password"
            bind:value={$formData.newPassword}
            minlength={8}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onclick={() => (showNewPassword = !showNewPassword)}
            disabled={isLoading}
            aria-label={showNewPassword
              ? m.ui_hide_password()
              : m.ui_show_password()}
          >
            {#if showNewPassword}
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

  <PasswordStrengthMeter password={String($formData.newPassword || "")} />

  <Form.Field {form} name="confirmPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.user_change_password_confirm()}</Form.Label>
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
            aria-label={showConfirmPassword
              ? m.ui_hide_password()
              : m.ui_show_password()}
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

  {#if infoMsg}<p class="text-sm text-green-600">{infoMsg}</p>{/if}
  {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
  <Button type="submit" disabled={isLoading}>
    {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
    {#if !isLoading}{m.user_change_password_submit()}{/if}
  </Button>
</form>
