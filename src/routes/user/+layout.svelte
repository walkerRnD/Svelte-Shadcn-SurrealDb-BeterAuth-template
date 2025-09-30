<script lang="ts">
  import UserLayout from "$lib/domain/user/ui/layout/UserLayout.svelte";
  import type { Snippet } from "svelte";

  type Props = { children?: Snippet<[]> };
  let { children }: Props = $props();
</script>

<UserLayout>
  {@render children?.()}
</UserLayout>
