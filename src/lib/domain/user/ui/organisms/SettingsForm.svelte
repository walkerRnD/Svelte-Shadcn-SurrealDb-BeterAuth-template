<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { updateUser } from "$lib/domain/api/api-client";
  import { m } from "$lib/paraglide/messages.js";
  import LoaderIcon from "@lucide/svelte/icons/loader";

  type Props = {
    initialName?: string;
    onSuccess?: () => void;
  };
  let { initialName = "", onSuccess }: Props = $props();

  let displayName = $state(initialName);
  let isLoading = $state(false);
  let infoMsg = $state("");
  let errorMsg = $state("");

  // Update displayName when initialName changes
  $effect(() => {
    if (initialName && !displayName) {
      displayName = initialName;
    }
  });

  async function handleSave(event: SubmitEvent) {
    event.preventDefault();
    infoMsg = "";
    errorMsg = "";
    isLoading = true;
    try {
      await updateUser({ name: displayName });
      infoMsg = m.user_settings_saved();
      onSuccess?.();
    } catch (e: any) {
      errorMsg = e?.message || m.user_settings_error();
    } finally {
      isLoading = false;
    }
  }
</script>

<Card class="max-w-lg">
  <CardHeader><CardTitle>{m.user_settings_card_title()}</CardTitle></CardHeader>
  <CardContent>
    <form onsubmit={handleSave} class="grid gap-3">
      <label class="grid gap-1">
        <span class="text-sm">{m.user_settings_display_name()}</span>
        <Input bind:value={displayName} autocomplete="name" />
      </label>

      {#if infoMsg}<p class="text-sm text-green-600">{infoMsg}</p>{/if}
      {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}

      <Button type="submit" disabled={isLoading}>
        {#if isLoading}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
        {#if !isLoading}{m.user_settings_save()}{/if}
      </Button>
    </form>
  </CardContent>
</Card>
