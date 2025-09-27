<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { signUp, signIn } from "$lib/domain/api/api-client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { defaults, superForm } from "sveltekit-superforms/client";
  import { createAccountSchema } from "$lib/domain/auth/schema/auth";
  import type { Snippet } from "svelte";

  // 📌 declare types separately
  type Props = {
    onSuccess?: () => void;
    title?: Snippet<[]>;
    footer?: Snippet<[]>;
  };

  // 📌 apply types to object. DON'T apply on function like $props<Props>()
  let {
    onSuccess,
    title,
    footer
  }: Props = $props();

  const clientAdapter: any = zodClient(createAccountSchema as any) as any;
  const data: any = defaults(
    { name: "", email: "", password: "" } as any,
    clientAdapter,
  );

  let isLoading = $state(false);
  const form = superForm<any>(data, {
    dataType: "json",
    SPA: true,
    resetForm: false,
    validators: clientAdapter,
    onSubmit: () => {
      isLoading = true;
    },
  });
  const { form: formData, enhance } = form;

  let errorMsg = $state("");
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = "";
    try {
      await signUp.email({
        name: String($formData.name || ""),
        email: String($formData.email || ""),
        password: String($formData.password || ""),
      });
      await signIn.email({
        email: String($formData.email || ""),
        password: String($formData.password || ""),
      });
      if (onSuccess) {
        onSuccess();
      } else {
        history.back();
      }
    } catch (e: any) {
      errorMsg = e?.message || "Failed to create account";
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if title}
  {@render title()}
{:else}
  <h1 class="text-xl font-semibold mb-4">Create account</h1>
{/if}

<form use:enhance onsubmit={handleSubmit} class="grid gap-3 max-w-sm">
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Name</Form.Label>
        <Input
          {...props}
          bind:value={$formData.name}
          autocomplete="name"
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input
          {...props}
          type="email"
          placeholder="example@test.com"
          autocomplete="email"
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
          autocomplete="new-password"
          bind:value={$formData.password}
          minlength={8}
          required
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  {#if errorMsg}
    <p class="text-sm text-red-600">{errorMsg}</p>
  {/if}

  <Button type="submit" class="mt-3 w-full" disabled={isLoading}>
    Create account
  </Button>

  {#if footer}
    {@render footer()}
  {:else}
    <div class="flex gap-2 mt-2">
      <a href="/auth/login" class="text-sm underline">Back to login</a>
    </div>
  {/if}
</form>
