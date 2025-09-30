<script lang="ts">
  type Props = { value: string | number; caption?: string };
  let { value, caption = "" }: Props = $props();
</script>

<div class="text-center">
  <div class="text-2xl font-bold">{value}</div>
  {#if caption}<div class="text-sm text-muted-foreground">{caption}</div>{/if}
</div>

