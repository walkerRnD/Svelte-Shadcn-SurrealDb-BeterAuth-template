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

  const isProd = import.meta.env.MODE === "production";
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
        body: JSON.stringify({ provider: "github" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      providers = Array.isArray(data?.providers) ? data.providers : providers;
      statusMsg = "Unlinked!";
    } catch (e: any) {
      statusMsg = e?.message || "Failed to unlink";
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
      statusMsg = "Linked!";
    } catch (e: any) {
      statusMsg = e?.message || "Failed to link";
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
        <div>
          <b>Providers:</b>
          {providers.length ? providers.join(", ") : "None"}
        </div>
        {#if providers.length}
          <div class="mt-2 flex flex-wrap gap-2">
            {#each providers as p}
              <span
                data-testid="provider-badge"
                data-provider={p}
                class="inline-flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 text-xs"
              >
                {#if p === "github"}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8"
                    />
                  </svg>
                {:else if p === "google"}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.53 0 6 1.53 7.38 2.82l5.02-4.91C33.88 4.04 29.38 2 24 2 14.82 2 6.96 7.44 3.69 15.02l6.44 5.01C11.5 14.6 17.16 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.64-.15-3.2-.44-4.7H24v9.14h12.66c-.54 2.9-2.2 5.35-4.66 7.02l7.1 5.51C43.74 37.18 46.5 31.36 46.5 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.13 20.03l-6.44-5C2.62 17.14 2 20.48 2 24s.62 6.86 1.69 8.97l6.44-5.01A13.45 13.45 0 0 1 9.5 24c0-1.4.24-2.74.63-3.97z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 46c5.84 0 10.76-1.93 14.34-5.27l-7.1-5.51c-1.98 1.33-4.51 2.1-7.24 2.1-6.84 0-12.5-5.1-13.88-11.53l-6.44 5.01C6.96 40.56 14.82 46 24 46z"
                    />
                  </svg>
                {/if}
                {p}
              </span>
            {/each}
          </div>
        {/if}
      </div>
      {#if !isProd}
        <div class="mt-3 grid gap-2">
          <div class="flex gap-2">
            <Button onclick={linkGithub}>Link GitHub (dev)</Button>
            <Button variant="secondary" onclick={unlinkGithub}
              >Unlink GitHub (dev)</Button
            >
          </div>
          <div class="flex gap-2">
            <Button onclick={linkGoogle}>Link Google (dev)</Button>
            <Button variant="secondary" onclick={unlinkGoogle}
              >Unlink Google (dev)</Button
            >
          </div>
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
