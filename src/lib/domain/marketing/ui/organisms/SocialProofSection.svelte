<script lang="ts">
  import Counter from "../atoms/Counter.svelte";
  import EnergyCardPreview from "../molecules/EnergyCardPreview.svelte";
</script>

<section class="container mx-auto max-w-5xl px-4 py-10 space-y-6">
  <div class="grid grid-cols-3 gap-4">
    <Counter value="3.200+" caption="Energy Cards criados" />
    <Counter value="480+" caption="Usuários ativos" />
    <Counter value="22+" caption="Países" />
  </div>
  <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
    {#each Array.from({ length: 6 }) as _}
      <EnergyCardPreview />
    {/each}
  </div>
</section>

