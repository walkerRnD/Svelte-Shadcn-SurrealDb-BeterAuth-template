<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signIn } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";

  import { loginSchema as LoginFormSchema } from "$lib/domain/+shared/schema/auth";

  const clientAdapter = zodClient(LoginFormSchema as any);
  const data = defaults({ email: "", password: "" }, clientAdapter);

  let isLoading = $state(false);
  // Using any for client-side typing due to Zod v4 adapter type variance; runtime validation still applies
  const form = superForm<any>(data, {
    dataType: "json",
    SPA: true,
    resetForm: false,
    validators: clientAdapter,
    onSubmit: () => {
      isLoading = true;
    },
    onUpdate: async () => {
      // handled via onsubmit below
    },
  });
  const { form: formData, enhance } = form;

  let errorMsg = $state("");
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = "";
    try {
      await signIn.email({
        email: String($formData.email || ""),
        password: String($formData.password || ""),
      });
      history.back();
    } catch (e: any) {
      errorMsg = e?.message || "Failed to sign in";
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">Login</h1>
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
        <Input
          {...props}
          type="email"
          placeholder="example@test.com"
          bind:value={$formData.email}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Password</Form.Label>
        <Input
          {...props}
          type="password"
          bind:value={$formData.password}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  {#if errorMsg}
    <p class="text-sm text-red-600">{errorMsg}</p>
  {/if}

  <Button type="submit" class="mt-3 w-full" disabled={isLoading}>Sign in</Button
  >
  <div class="flex gap-2 mt-2">
    <a href="/auth/create-account" class="text-sm underline">Create account</a>
    <a href="/auth/reset-password" class="text-sm underline">Reset password</a>
  </div>
</form>
