<script lang="ts">
  import AdminGuard from "$lib/domain/+shared/ui/guards/AdminGuard.svelte";
  import AdminLayout from "$lib/domain/admin/ui/layout/AdminLayout.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import { m } from "$lib/paraglide/messages.js";

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
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold">{m.admin_dashboard_title()}</h1>
            <p class="text-muted-foreground mt-1">
              {m.admin_dashboard_subtitle()}
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{m.admin_card_prompts_title()}</CardTitle>
                <CardDescription>{m.admin_card_prompts_desc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/admin/prompts" class="text-primary hover:underline">
                  {m.admin_card_prompts_cta()}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{m.admin_card_users_title()}</CardTitle>
                <CardDescription>{m.admin_card_users_desc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-sm">
                  {m.admin_card_users_coming_soon()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{m.admin_card_analytics_title()}</CardTitle>
                <CardDescription
                  >{m.admin_card_analytics_desc()}</CardDescription
                >
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-sm">
                  {m.admin_card_analytics_coming_soon()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      {/snippet}
    </AdminLayout>
  {/snippet}
</AdminGuard>
