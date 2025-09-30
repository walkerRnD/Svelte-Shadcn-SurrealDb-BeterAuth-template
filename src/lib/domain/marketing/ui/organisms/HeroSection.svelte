<script lang="ts">
  import CTAButton from "../atoms/CTAButton.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    title?: Snippet<[]>;
    subtitle?: Snippet<[]>;
  };
  let { title, subtitle }: Props = $props();
</script>

<section class="container mx-auto max-w-5xl px-4 py-12 grid gap-6 md:grid-cols-2 items-center">
  <div class="space-y-4">
    <h1 class="text-3xl md:text-5xl font-extrabold leading-tight">
      {#if title}{@render title()}{:else}Transforme seus momentos em arte única{/if}
    </h1>
    <p class="text-lg text-muted-foreground">
      {#if subtitle}{@render subtitle()}{:else}IA analisa sua vibe e cria Energy Cards personalizados em minutos{/if}
    </p>
    <div class="flex flex-wrap gap-3 pt-2">
      <CTAButton href="/auth/create-account" />
      <CTAButton href="/demo" variant="secondary">
        {#snippet label()}Ver Exemplo{/snippet}
      </CTAButton>
    </div>
  </div>
  <div class="rounded-xl border overflow-hidden">
    <div class="aspect-video bg-[oklch(0.97_0_0)] flex items-center justify-center text-sm text-muted-foreground">
      Vídeo demonstrativo (hero-demo.mp4)
    </div>
  </div>
</section>

