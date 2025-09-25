<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { forgetPassword } from "$lib/domain/api/api-client";
  import { z } from "zod";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";

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
  let token = $state<string | null>(null);

  // Detect token from query (?token=...)
  if (typeof window !== "undefined") {
    const u = new URL(window.location.href);
    token = u.searchParams.get("token");
  }

  const form = superForm<any>(data, {
    dataType: "json",
    SPA: true,
    resetForm: false,
    validators: clientAdapter,
  });
  const { form: formData, enhance } = form;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    infoMsg = "";
    errorMsg = "";
    try {
      await forgetPassword({ email: String($formData.email || "") });
      infoMsg = "If this email exists, a reset link has been sent.";
    } catch (e: any) {
      errorMsg = e?.message || "Failed to start reset";
      console.error(e);
    }
  }

  async function handleReset(event: SubmitEvent) {
    event.preventDefault();
    infoMsg = "";
    errorMsg = "";
    try {
      const pw = String($formData.password || "");
      const confirm = String($formData.confirm || "");
      if (pw.length < 8)
        throw new Error("Password must be at least 8 characters");
      if (pw !== confirm) throw new Error("Passwords do not match");
      if (!token) throw new Error("Missing token");
      const { resetPassword } = await import("$lib/domain/api/api-client");
      await resetPassword({ token, newPassword: pw });
      infoMsg = "Password has been reset. Redirecting to login...";
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = "/auth/login";
      }, 900);
    } catch (e: any) {
      errorMsg = e?.message || "Failed to reset password";
      console.error(e);
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">Reset password</h1>
{#if token}
  <form use:enhance onsubmit={handleReset} class="grid gap-3 max-w-sm">
    <Form.Field {form} name="password">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>New password</Form.Label>
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
          <Form.Label>Confirm password</Form.Label>
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

    {#if infoMsg}<p class="text-sm text-green-600">{infoMsg}</p>{/if}
    {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
    <div class="flex gap-2">
      <Button type="submit">Reset password</Button>
      <a href="/auth/login" class="text-sm underline">Back to login</a>
    </div>
  </form>
{:else}
  <form use:enhance onsubmit={handleSubmit} class="grid gap-3 max-w-sm">
    <Form.Field {form} name="email">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Email</Form.Label>
          <Input
            {...props}
            type="email"
            autocomplete="email"
            bind:value={$formData.email}
            required
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    {#if infoMsg}<p class="text-sm text-green-600">{infoMsg}</p>{/if}
    {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
    <div class="flex gap-2">
      <Button type="submit">Send link</Button>
      <a href="/auth/login" class="text-sm underline">Back to login</a>
    </div>
  </form>
{/if}
