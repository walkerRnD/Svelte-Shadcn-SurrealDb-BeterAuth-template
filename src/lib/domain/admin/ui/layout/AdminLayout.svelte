<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { Snippet } from "svelte";
  import { page } from "$app/stores";
  import { m } from "$lib/paraglide/messages.js";

  // 📌 declare Props separately and apply to $props object
  type Props = { children?: Snippet<[]> };
  let { children }: Props = $props();

  const links = $derived([
    { href: "/admin", label: m.admin_nav_dashboard() },
    { href: "/admin/prompts", label: m.admin_nav_prompts() },
    { href: "/admin/users", label: m.admin_nav_users() },
    { href: "/admin/analytics", label: m.admin_nav_analytics() },
  ] as const);

  function isActive(href: string) {
    const path = $page.url.pathname;
    // Exact match for dashboard, prefix match for others
    if (href === "/admin") {
      return path === href;
    }
    return path.startsWith(href);
  }
</script>

<!-- Simple admin area shell navigation -->
<nav class="mb-6 flex flex-wrap gap-2 border-b pb-4">
  {#each links as l}
    <a href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
      <Button variant={isActive(l.href) ? "default" : "ghost"}>{l.label}</Button
      >
    </a>
  {/each}
</nav>

<main class="min-h-[400px]">
  {@render children?.()}
</main>
