<script lang="ts">
  import type { Snippet } from "svelte";
  type Props = {
    header?: Snippet<[]>;
    content?: Snippet<[]>;
    footer?: Snippet<[]>;
  };
  let { header, content, footer }: Props = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header
    class="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    {@render header?.()}
  </header>
  <main class="container mx-auto max-w-5xl w-full p-4 flex-1">
    {@render content?.()}
  </main>
  <footer class="border-t text-xs text-muted-foreground py-3 text-center">
    {@render footer?.()}
  </footer>
</div>
