<script lang="ts">
  import { useSession } from "$lib/domain/api/api-client";
  import { goto } from "$app/navigation";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import LoginPage from "$lib/domain/auth/ui/page/LoginPage.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import type { Snippet } from "svelte";
  import { m } from "$lib/paraglide/messages.js";

  // 📌 declare types separately
  type Props = {
    children: Snippet<[]>;
    fallback?: Snippet<[]>;
    loadingMessage?: string;
    adminEmails?: string[]; // List of admin emails, if not provided, checks for admin role
    checkAdminRole?: (user: any) => boolean; // Custom admin check function
  };

  // 📌 apply types to object
  let {
    children,
    fallback,
    loadingMessage = "Loading...",
    adminEmails = [],
    checkAdminRole,
  }: Props = $props();

  const session = useSession();
  const isBrowser = typeof window !== "undefined";
  const loading = $derived(
    ($session as any)?.isPending ?? typeof $session.data === "undefined",
  );

  // Default admin check: either in adminEmails list or has admin role
  function isAdmin(user: any): boolean {
    if (checkAdminRole) {
      return checkAdminRole(user);
    }

    // Check if user email is in admin list
    if (adminEmails.length > 0 && user?.email) {
      return adminEmails.includes(user.email);
    }

    // Check for admin role (if implemented in the future)
    if (user?.role === "admin" || user?.roles?.includes("admin")) {
      return true;
    }

    // Default: no admin access
    return false;
  }

  // Automatically redirect non-admin authenticated users
  $effect(() => {
    if ($session.data?.user && !isAdmin($session.data.user)) {
      goto("/user/profile");
    }
  });

  async function redirectToProfile() {
    await goto("/user/profile");
  }
</script>

{#if loading}
  <!-- Loading state -->
  <div class="flex items-center justify-center min-h-[200px]">
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderIcon class="h-4 w-4 animate-spin" />
      {loadingMessage}
    </div>
  </div>
{:else if !$session.data?.user}
  <!-- User is not authenticated, show auth form or fallback -->
  {#if isBrowser}
    {#if fallback}
      {@render fallback()}
    {:else}
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="w-full max-w-md">
          <LoginPage
            onSuccess={() => {
              /* session updates */
            }}
          />
        </div>
      </div>
    {/if}
  {:else}
    <!-- SSR: avoid flashing login before hydration -->
    <div class="flex items-center justify-center min-h-[200px]">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderIcon class="h-4 w-4 animate-spin" />
        {loadingMessage}
      </div>
    </div>
  {/if}
{:else if !isAdmin($session.data.user)}
  <!-- User is authenticated but not authorized -->
  <div class="flex items-center justify-center min-h-[400px]">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-center"
          >{m.admin_guard_access_denied()}</CardTitle
        >
      </CardHeader>
      <CardContent class="text-center space-y-4">
        <p class="text-muted-foreground">
          {m.admin_guard_no_permission()}
        </p>
        <Button onclick={redirectToProfile} class="w-full">
          {m.admin_guard_go_to_profile()}
        </Button>
      </CardContent>
    </Card>
  </div>
{:else}
  <!-- User is authenticated and authorized, render protected content -->
  {@render children()}
{/if}
