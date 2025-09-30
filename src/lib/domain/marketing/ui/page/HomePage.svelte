<script lang="ts">
  import HeroSection from "../organisms/HeroSection.svelte";
  import HowItWorksSection from "../organisms/HowItWorksSection.svelte";
  import SocialProofSection from "../organisms/SocialProofSection.svelte";
  import UseCasesSection from "../organisms/UseCasesSection.svelte";
  import PricingTeaser from "../organisms/PricingTeaser.svelte";
</script>

<svelte:head>
  <title>PicFlow — Transforme Momentos em Energy Cards Únicos</title>
  <meta name="description" content="Crie Energy Cards personalizados com IA. Capture sua vibe; nossa IA analisa e gera arte única em minutos. Comece grátis!" />
  <meta property="og:title" content="PicFlow — Transforme Momentos em Energy Cards Únicos" />
  <meta property="og:description" content="Crie Energy Cards personalizados com IA e compartilhe com um clique." />
  <meta property="og:type" content="website" />
</svelte:head>

<main class="pb-10">
  <HeroSection />
  <SocialProofSection />
  <HowItWorksSection />
  <UseCasesSection />
  <PricingTeaser />
</main>

