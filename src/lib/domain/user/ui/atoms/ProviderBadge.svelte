<script lang="ts">
  import GithubIcon from "@lucide/svelte/icons/github";
  import GlobeIcon from "@lucide/svelte/icons/globe";

  type Props = {
    provider: string;
  };
  let { provider }: Props = $props();
</script>

<span
  data-testid="provider-badge"
  data-provider={provider}
  class="inline-flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 text-xs"
>
  {#if provider === "github"}
    <GithubIcon class="h-3.5 w-3.5" aria-hidden="true" />
  {:else if provider === "google"}
    <GlobeIcon class="h-3.5 w-3.5" aria-hidden="true" />
  {/if}
  {provider}
</span>

