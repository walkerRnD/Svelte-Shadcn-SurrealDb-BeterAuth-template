<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { Snippet } from "svelte";
  import { page } from "$app/stores";
  import { m } from "$lib/paraglide/messages.js";

  // declare Props separately and apply to $props object
  type Props = { children?: Snippet<[]> };
  let { children }: Props = $props();

  const links = $derived([
    { href: "/user/profile", label: m.user_nav_profile() },
    { href: "/user/settings", label: m.user_nav_settings() },
    { href: "/user/account", label: m.user_nav_account() },
  ] as const);

  function isActive(href: string) {
    const path = $page.url.pathname;
    // highlight exact page or nested paths (e.g., /user/account/*)
    return path === href || path.startsWith(href + "/");
  }
</script>

<!-- Simple user area shell navigation; i18n-ready labels -->
<nav class="mb-4 flex flex-wrap gap-1">
  {#each links as l}
    <a href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
      <Button variant={isActive(l.href) ? "secondary" : "ghost"}>{l.label}</Button>
    </a>
  {/each}
</nav>

<main class="min-h-[200px]">
  {@render children?.()}
</main>

