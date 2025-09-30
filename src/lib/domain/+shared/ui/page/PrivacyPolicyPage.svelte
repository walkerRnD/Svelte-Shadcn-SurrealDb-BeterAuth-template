<script lang="ts">
  import { getLocale } from "$lib/paraglide/runtime";
  import * as m from "$lib/paraglide/messages";
  import PrivacyPT from "$lib/content/policies/privacy.pt.svx";
  import PrivacyEN from "$lib/content/policies/privacy.en.svx";
  import PrivacyES from "$lib/content/policies/privacy.es.svx";

  // Select content based on active locale
  const locale = $derived(getLocale());
  const PrivacyContent = $derived(
    locale === "pt" ? PrivacyPT : locale === "es" ? PrivacyES : PrivacyEN,
  );
</script>

<svelte:head>
  <title>{m.policy_privacy_title()} - {m.policy_pic_flow()}</title>
</svelte:head>

<div class="container my-5">
  <div
    class="pb-5 space-y-4 mx-auto max-w-[50rem] dark:prose-invert prose prose-base prose-slate prose-headings:font-extrabold prose-h1:text-4xl prose-h1:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-a:font-semibold prose-a:text-sky-500 prose-a:no-underline hover:prose-a:text-sky-600 prose-code:text-[13px]/[1.692] prose-pre:rounded-lg prose-pre:px-4 prose-pre:py-[0.875rem] prose-strong:font-bold"
  >
    <PrivacyContent />
  </div>
</div>
