<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { useSession } from "$lib/domain/api/api-client";
  const session = useSession();

  const isProd = process.env.NODE_ENV === "production";
  let statusMsg = $state("");
  async function linkGithub() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: $session.data?.user?.id,
          provider: "github",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      statusMsg = "Linked!";
    } catch (e: any) {
      statusMsg = e?.message || "Failed to link";
    }
  }
  async function unlinkGithub() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/unlink", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: $session.data?.user?.id,
          provider: "github",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      statusMsg = "Unlinked!";
    } catch (e: any) {
      statusMsg = e?.message || "Failed to unlink";
    }
  }
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
      {#if !isProd}
        <div class="mt-3 flex gap-2">
          <Button onclick={linkGithub}>Link GitHub (dev)</Button>
          <Button variant="secondary" onclick={unlinkGithub}
            >Unlink GitHub (dev)</Button
          >
        </div>
        {#if statusMsg}
          <p class="text-sm mt-2">{statusMsg}</p>
        {/if}
      {/if}
    {:else}
      <p>Not signed in.</p>
    {/if}
  </CardContent>
</Card>
