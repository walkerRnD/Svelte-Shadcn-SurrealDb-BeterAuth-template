<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { useSession } from "$lib/domain/api/api-client";

  const session = useSession();
  const devLoginEnabled =
    import.meta.env.MODE !== "production" ||
    import.meta.env.VITE_DEV_LOGIN === "true";

  async function handleLogout() {
    try {
      // Use server-side logout to ensure cookies are cleared and redirect happens
      const res = await fetch("/auth/logout", { method: "POST" });
      // Follow redirect client-side in case the platform doesn't auto-follow on POST-303
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
    }
  }
</script>

<nav
  class="container mx-auto max-w-5xl w-full p-3 flex items-center justify-between"
>
  <a href="/" class="font-semibold">App</a>
  <div class="flex items-center gap-2">
    {#if $session.data?.user}
      <span class="text-sm"
        >{$session.data.user.name || $session.data.user.email}</span
      >
      <Button onclick={handleLogout}>Logout</Button>
    {:else}
      <a href="/auth/login"><Button variant="secondary">Login</Button></a>
      {#if devLoginEnabled}
        <a href="/auth/login"><Button>Dev Login</Button></a>
      {/if}
    {/if}
  </div>
</nav>
