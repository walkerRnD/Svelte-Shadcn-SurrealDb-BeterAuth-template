<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { m } from "$lib/paraglide/messages.js";
  import ProviderBadge from "../atoms/ProviderBadge.svelte";

  type Props = {
    userId?: string;
    userName?: string | null;
    userEmail?: string;
    providers?: string[];
  };
  let {
    userId,
    userName,
    userEmail,
    providers = [],
  }: Props = $props();
</script>

<Card class="max-w-lg">
  <CardHeader>
    <CardTitle>{m.user_profile_card_title()}</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid gap-1 text-sm">
      <div><b>{m.user_profile_id()}</b> {userId}</div>
      <div><b>{m.user_profile_name()}</b> {userName}</div>
      <div><b>{m.user_profile_email()}</b> {userEmail}</div>
      <div>
        <b>{m.user_profile_providers()}</b>
        {providers.length ? providers.join(", ") : m.user_profile_none()}
      </div>
      {#if providers.length}
        <div class="mt-2 flex flex-wrap gap-2">
          {#each providers as p}
            <ProviderBadge provider={p} />
          {/each}
        </div>
      {/if}
    </div>
  </CardContent>
</Card>

