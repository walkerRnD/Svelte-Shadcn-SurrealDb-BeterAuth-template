<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  // Redirect to profile page as the default user home
  onMount(() => {
    goto("/user/profile", { replaceState: true });
  });
</script>

<div class="text-center py-8">
  <p class="text-muted-foreground">Redirecting to profile...</p>
</div>

