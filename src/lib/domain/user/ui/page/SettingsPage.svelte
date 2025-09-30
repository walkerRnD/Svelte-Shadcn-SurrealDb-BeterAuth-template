<script lang="ts">
  import UserGuard from "$lib/domain/+shared/ui/guards/UserGuard.svelte";
  import { useSession } from "$lib/domain/api/api-client";
  import { m } from "$lib/paraglide/messages.js";
  import SettingsForm from "../organisms/SettingsForm.svelte";

  const session = useSession();

  // Get initial name from session
  let initialName = $derived(String($session.data?.user?.name ?? ""));
</script>

<h1 class="text-xl font-semibold mb-4">{m.user_settings_title()}</h1>
<UserGuard>
  {#snippet children()}
    <SettingsForm {initialName} />
  {/snippet}
</UserGuard>

