<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { Snippet } from "svelte";

  type Props = {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    label?: Snippet<[]>;
    variant?: "primary" | "secondary";
  };
  let { href, onclick, label, variant = "primary" }: Props = $props();
</script>

{#if href}
  <a href={href} class="inline-block">
    <Button
      class={variant === "primary"
        ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white"
        : "border border-border"}
      {onclick}
    >
      {#if label}{@render label()}{:else}Começar Grátis{/if}
    </Button>
  </a>
{:else}
  <Button
    class={variant === "primary"
      ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white"
      : "border border-border"}
    {onclick}
  >
    {#if label}{@render label()}{:else}Começar Grátis{/if}
  </Button>
{/if}

