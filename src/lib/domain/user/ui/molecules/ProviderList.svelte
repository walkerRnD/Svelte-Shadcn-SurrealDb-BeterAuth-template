<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  type Props = {
    providers?: string[];
    onLinkGithub?: () => void;
    onUnlinkGithub?: () => void;
    onLinkGoogle?: () => void;
    onUnlinkGoogle?: () => void;
    statusMsg?: string;
  };
  let {
    providers = [],
    onLinkGithub,
    onUnlinkGithub,
    onLinkGoogle,
    onUnlinkGoogle,
    statusMsg = "",
  }: Props = $props();

  // Dev-only UI copy (not translated)
  const devUI = {
    linkGithub: "Link GitHub (dev)",
    unlinkGithub: "Unlink GitHub (dev)",
    linkGoogle: "Link Google (dev)",
    unlinkGoogle: "Unlink Google (dev)",
  } as const;
</script>

<div class="mt-3 grid gap-2">
  <div class="flex gap-2">
    <Button onclick={onLinkGithub}>{devUI.linkGithub}</Button>
    <Button variant="secondary" onclick={onUnlinkGithub}
      >{devUI.unlinkGithub}</Button
    >
  </div>
  <div class="flex gap-2">
    <Button onclick={onLinkGoogle}>{devUI.linkGoogle}</Button>
    <Button variant="secondary" onclick={onUnlinkGoogle}
      >{devUI.unlinkGoogle}</Button
    >
  </div>
</div>
{#if statusMsg}
  <p class="text-sm mt-2" aria-live="polite">{statusMsg}</p>
{/if}

