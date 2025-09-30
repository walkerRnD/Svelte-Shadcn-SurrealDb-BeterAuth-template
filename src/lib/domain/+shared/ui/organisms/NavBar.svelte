<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { useSession } from "$lib/domain/api/api-client";
  import { m } from "$lib/paraglide/messages.js";
  import LanguageSwitcher from "$lib/domain/+shared/ui/atoms/LanguageSwitcher.svelte";
  import DevLoginButton from "$lib/domain/auth/ui/atoms/DevLoginButton.svelte";
  import LoaderIcon from "@lucide/svelte/icons/loader";

  const session = useSession();
  let isLoggingOut = $state(false);

  async function handleLogout() {
    if (isLoggingOut) return; // guard double click
    isLoggingOut = true;
    try {
      // Use server-side logout to ensure cookies are cleared and redirect happens
      const res = await fetch("/auth/logout", { method: "POST" });
      // Follow redirect client-side in case the platform doesn't auto-follow on POST-303
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
      isLoggingOut = false;
    }
  }
</script>

<nav
  class="container mx-auto max-w-5xl w-full p-3 flex items-center justify-between"
>
  <div class="flex items-center gap-4">
    <a href="/" class="font-semibold">{m.nav_app()}</a>
    <a
      href="/pages/about"
      class="text-sm text-muted-foreground hover:text-foreground"
      >{m.nav_about()}</a
    >
  </div>
  <div class="flex items-center gap-2">
    <LanguageSwitcher />
    {#if $session.data?.user}
      <a
        href="/user/profile"
        class="text-sm underline-offset-2 hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
      >
        {$session.data.user.name || $session.data.user.email}
      </a>
      <Button onclick={handleLogout} disabled={isLoggingOut}>
        {#if isLoggingOut}<LoaderIcon class="h-4 w-4 animate-spin" />{/if}
        {#if !isLoggingOut}Logout{/if}
      </Button>
    {:else}
      <a href="/auth/login"><Button variant="secondary">Login</Button></a>
      <DevLoginButton />
    {/if}
  </div>
</nav>
