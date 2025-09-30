<script lang="ts">
  import { useSession } from "$lib/domain/api/api-client";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import LoginPage from "$lib/domain/auth/ui/page/LoginPage.svelte";
  import type { Snippet } from "svelte";

  // 📌 declare types separately
  type Props = {
    children: Snippet<[]>;
    fallback?: Snippet<[]>;
    loadingMessage?: string;
  };

  // 📌 apply types to object
  let { children, fallback, loadingMessage = "Loading..." }: Props = $props();

  const session = useSession();
  const isBrowser = typeof window !== "undefined";
  const loading = $derived(
    ($session as any)?.isPending ?? typeof $session.data === "undefined",
  );
</script>

{#if loading}
  <!-- Loading state -->
  <div class="flex items-center justify-center min-h-[200px]">
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderIcon class="h-4 w-4 animate-spin" />
      {loadingMessage}
    </div>
  </div>
{:else if $session.data?.user}
  <!-- User is authenticated, render protected content -->
  {@render children()}
{:else}
  <!-- User is not authenticated -->
  {#if isBrowser}
    {#if fallback}
      {@render fallback()}
    {:else}
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="w-full max-w-md">
          <LoginPage
            onSuccess={() => {
              /* session will update */
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
{/if}
