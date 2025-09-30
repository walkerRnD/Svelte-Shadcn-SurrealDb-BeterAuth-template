<script lang="ts">
  type Props = { alt?: string };
  let { alt = "Energy Card preview" }: Props = $props();
</script>

<div class="rounded-lg overflow-hidden border bg-[oklch(0.98_0_0)]">
  <div
    class="aspect-[3/4] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"
    aria-label={alt}
  ></div>
</div>
