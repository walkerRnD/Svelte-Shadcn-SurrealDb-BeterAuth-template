<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { useSession } from '$lib/domain/api/api-client';
  const session = useSession();
</script>

<h1 class="text-xl font-semibold mb-4">Profile</h1>
<Card class="max-w-lg">
  <CardHeader>
    <CardTitle>User</CardTitle>
  </CardHeader>
  <CardContent>
    {#if $session.data?.user}
      <div class="grid gap-1 text-sm">
        <div><b>ID:</b> {$session.data.user.id}</div>
        <div><b>Name:</b> {$session.data.user.name}</div>
        <div><b>Email:</b> {$session.data.user.email}</div>
      </div>
    {:else}
      <p>Not signed in.</p>
    {/if}
  </CardContent>
</Card>

