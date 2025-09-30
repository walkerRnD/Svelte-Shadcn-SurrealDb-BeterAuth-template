<script lang="ts">
  import AdminGuard from "$lib/domain/+shared/ui/guards/AdminGuard.svelte";
  import AdminLayout from "$lib/domain/admin/ui/layout/AdminLayout.svelte";
  import PromptManagementPage from "$lib/domain/admin/ui/page/PromptManagementPage.svelte";

  // 📌 TODO: Replace with actual admin emails from environment or database
  const adminEmails = [
    "admin@example.com",
    "stylethewalker@gmail.com",
    "dev+e2e@example.com",
  ];
</script>

<AdminGuard {adminEmails}>
  {#snippet children()}
    <AdminLayout>
      {#snippet children()}
        <PromptManagementPage />
      {/snippet}
    </AdminLayout>
  {/snippet}
</AdminGuard>
