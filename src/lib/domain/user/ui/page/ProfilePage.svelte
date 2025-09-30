<script lang="ts">
  import UserGuard from "$lib/domain/+shared/ui/guards/UserGuard.svelte";
  import { useSession } from "$lib/domain/api/api-client";
  import { m } from "$lib/paraglide/messages.js";
  import UserInfoCard from "../molecules/UserInfoCard.svelte";
  import ProviderList from "../molecules/ProviderList.svelte";

  const session = useSession();
  const isProd = import.meta.env.MODE === "production";

  // Dev-only UI copy (not translated)
  const devUI = {
    linked: "Linked!",
    unlinked: "Unlinked!",
    failLink: "Failed to link",
    failUnlink: "Failed to unlink",
  } as const;

  let statusMsg = $state("");
  let providers = $state<string[]>([]);

  // Load providers when profile mounts
  if (typeof window !== "undefined") {
    fetch("/api/auth/provider/list")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          providers = Array.isArray(data?.providers) ? data.providers : [];
        }
      })
      .catch(() => {});
  }

  async function linkGithub() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "github" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      providers = Array.isArray(data?.providers) ? data.providers : providers;
      statusMsg = devUI.linked;
    } catch (e: any) {
      statusMsg = e?.message || devUI.failLink;
    }
  }

  async function unlinkGithub() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/unlink", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "github" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      providers = Array.isArray(data?.providers) ? data.providers : providers;
      statusMsg = devUI.unlinked;
    } catch (e: any) {
      statusMsg = e?.message || devUI.failUnlink;
    }
  }

  async function linkGoogle() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      providers = Array.isArray(data?.providers) ? data.providers : providers;
      statusMsg = devUI.linked;
    } catch (e: any) {
      statusMsg = e?.message || devUI.failLink;
    }
  }

  async function unlinkGoogle() {
    statusMsg = "";
    try {
      const res = await fetch("/api/auth/provider/unlink", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      providers = Array.isArray(data?.providers) ? data.providers : providers;
      statusMsg = devUI.unlinked;
    } catch (e: any) {
      statusMsg = e?.message || devUI.failUnlink;
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">{m.user_profile_title()}</h1>
<UserGuard>
  {#snippet children()}
    <UserInfoCard
      userId={$session.data?.user.id}
      userName={$session.data?.user.name}
      userEmail={$session.data?.user.email}
      {providers}
    />
    {#if !isProd}
      <ProviderList
        {providers}
        onLinkGithub={linkGithub}
        onUnlinkGithub={unlinkGithub}
        onLinkGoogle={linkGoogle}
        onUnlinkGoogle={unlinkGoogle}
        {statusMsg}
      />
    {/if}
  {/snippet}
</UserGuard>

