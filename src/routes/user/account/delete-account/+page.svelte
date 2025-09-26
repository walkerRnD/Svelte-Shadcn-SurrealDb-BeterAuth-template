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
  let open = false;
  let errorMsg = "";
  async function handleDelete() {
    errorMsg = "";
    try {
      await deleteUser();
      open = false;
      location.href = "/";
    } catch (e: any) {
      errorMsg = e?.message || "Failed to delete account";
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">Delete account</h1>
<Dialog bind:open>
  <DialogTrigger>
    {#snippet child({ props })}
      <Button variant="destructive" {...props}>Delete my account</Button>
    {/snippet}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    {#if errorMsg}<p class="text-sm text-red-600">{errorMsg}</p>{/if}
    <DialogFooter>
      <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
      <Button variant="destructive" onclick={handleDelete}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
