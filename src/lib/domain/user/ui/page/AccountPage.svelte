<script lang="ts">
  import UserGuard from "$lib/domain/+shared/ui/guards/UserGuard.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import AccountActionsCard from "../molecules/AccountActionsCard.svelte";
</script>

<h1 class="text-xl font-semibold mb-4">{m.user_account_title()}</h1>
<UserGuard>
  {#snippet children()}
    <AccountActionsCard />
  {/snippet}
</UserGuard>

