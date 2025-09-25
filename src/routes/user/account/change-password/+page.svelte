<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { changePassword } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import { changePasswordSchema } from "$lib/domain/+shared/schema/auth";

  const clientAdapter = zodClient(changePasswordSchema);
  const data = defaults(
    { currentPassword: "", newPassword: "" },
    clientAdapter,
  );

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
      await changePassword({
        currentPassword: String($formData.currentPassword || ""),
        newPassword: String($formData.newPassword || ""),
      });
      infoMsg = "Password changed.";
      form.reset();
    } catch (e: any) {
      errorMsg = e?.message || "Failed to change password";
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">Change password</h1>
<form
  method="POST"
  use:enhance
  onsubmit={handleSubmit}
  class="grid gap-3 max-w-sm"
>
  <Form.Field {form} name="currentPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Current password</Form.Label>
        <Input
          {...props}
          type="password"
          bind:value={$formData.currentPassword}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="newPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>New password</Form.Label>
        <Input
          {...props}
          type="password"
          bind:value={$formData.newPassword}
          minlength={8}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  {#if infoMsg}<p class="text-sm text-green-600">{infoMsg}</p>{/if}
  {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
  <Button type="submit">Change</Button>
</form>
