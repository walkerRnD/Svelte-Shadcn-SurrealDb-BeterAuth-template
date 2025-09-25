<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { forgetPassword } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import { resetPasswordSchema as ResetPasswordSchema } from "$lib/domain/+shared/schema/auth";

  const clientAdapter = zodClient(ResetPasswordSchema as any);
  const data = defaults({ email: "" }, clientAdapter);

  let infoMsg = $state("");
  let errorMsg = $state("");

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
</script>

<h1 class="text-xl font-semibold mb-4">Reset password</h1>
<form
  method="POST"
  use:enhance
  onsubmit={handleSubmit}
  class="grid gap-3 max-w-sm"
>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input {...props} type="email" bind:value={$formData.email} required />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  {#if infoMsg}
    <p class="text-sm text-green-600">{infoMsg}</p>
  {/if}
  {#if errorMsg}
    <p class="text-sm text-red-600">{errorMsg}</p>
  {/if}
  <div class="flex gap-2">
    <Button type="submit">Send link</Button>
    <a href="/auth/login" class="text-sm underline">Back to login</a>
  </div>
</form>
