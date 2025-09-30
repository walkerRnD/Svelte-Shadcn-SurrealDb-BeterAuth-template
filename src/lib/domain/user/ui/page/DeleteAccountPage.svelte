<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog";
  import { deleteUser } from "$lib/domain/api/api-client";
  import { m } from "$lib/paraglide/messages.js";
  import LoaderIcon from "@lucide/svelte/icons/loader";

  let open = $state(false);
  let errorMsg = $state("");
  let isDeleting = $state(false);

  async function handleDelete() {
    if (isDeleting) return; // guard double click
    errorMsg = "";
    isDeleting = true;
    try {
      await deleteUser();
      open = false;
      location.href = "/";
    } catch (e: any) {
      errorMsg = e?.message || m.user_delete_account_error();
    } finally {
      isDeleting = false;
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">{m.user_delete_account_title()}</h1>
<Dialog bind:open>
  <DialogTrigger>
    {#snippet child({ props })}
      <Button variant="destructive" {...props}>
        {m.user_delete_account_button()}
      </Button>
    {/snippet}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{m.user_delete_account_dialog_title()}</DialogTitle>
      <DialogDescription>
        {m.user_delete_account_dialog_description()}
      </DialogDescription>
    </DialogHeader>
    {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
    <DialogFooter>
      <Button
        variant="secondary"
        onclick={() => (open = false)}
        disabled={isDeleting}
      >
        {m.user_delete_account_cancel()}
      </Button>
      <Button
        variant="destructive"
        onclick={handleDelete}
        disabled={isDeleting}
      >
        {#if isDeleting}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
        {m.user_delete_account_confirm()}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
