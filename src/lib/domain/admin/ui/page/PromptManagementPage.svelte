<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import type { UIPromptPublic } from "$lib/domain/admin/types/prompt";
  import PromptCard from "../molecules/PromptCard.svelte";
  import CreatePromptDialog from "../organisms/CreatePromptDialog.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import ErrorBanner from "$lib/domain/+shared/ui/atoms/ErrorBanner.svelte";

  let prompts = $state<UIPromptPublic[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedType = $state<"analysis" | "generation" | "all">("all");
  let searchQuery = $state("");
  let showCreateDialog = $state(false);
  let actionLoading = $state<{ [key: string]: boolean }>({});

  async function loadPrompts() {
    isLoading = true;
    error = null;
    try {
      const typeParam = selectedType === "all" ? "" : `?type=${selectedType}`;
      const response = await fetch(`/api/admin/prompts${typeParam}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || m.admin_prompts_error_load());
      }

      prompts = data.prompts || [];
    } catch (e: any) {
      error = e.message || m.admin_prompts_error_load();
      console.error("Load prompts error:", e);
    } finally {
      isLoading = false;
    }
  }

  async function handleToggleActive(promptId: string, isActive: boolean) {
    const loadingKey = `toggle-${promptId}`;
    actionLoading[loadingKey] = true;

    // Optimistic update
    const previousPrompts = [...prompts];
    prompts = prompts.map((p) =>
      p.id === promptId ? { ...p, is_active: isActive } : p,
    );

    try {
      const response = await fetch(
        `/api/admin/prompts/${promptId}/toggle-active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: isActive }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || m.admin_prompts_error_toggle());
      }

      // Update with server response
      prompts = prompts.map((p) => (p.id === promptId ? data.prompt : p));
    } catch (e: any) {
      // Revert on error
      prompts = previousPrompts;
      error = e.message || m.admin_prompts_error_toggle();
      console.error("Toggle active error:", e);
    } finally {
      delete actionLoading[loadingKey];
      actionLoading = { ...actionLoading };
    }
  }

  async function handleSetDefault(
    promptId: string,
    type: "analysis" | "generation",
  ) {
    const loadingKey = `default-${promptId}`;
    actionLoading[loadingKey] = true;

    try {
      const response = await fetch(
        `/api/admin/prompts/${promptId}/set-default`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || m.admin_prompts_error_set_default());
      }

      // Reload to update all prompts (previous default needs to be updated)
      await loadPrompts();
    } catch (e: any) {
      error = e.message || m.admin_prompts_error_set_default();
      console.error("Set default error:", e);
    } finally {
      delete actionLoading[loadingKey];
      actionLoading = { ...actionLoading };
    }
  }

  async function handleDelete(promptId: string) {
    // Will be handled by PromptCard with proper dialog
  }

  function handlePromptCreated() {
    showCreateDialog = false;
    loadPrompts();
  }

  // Load prompts on mount and when type changes
  $effect(() => {
    loadPrompts();
  });

  const filteredPrompts = $derived(
    prompts
      .filter((p) => selectedType === "all" || p.type === selectedType)
      .filter(
        (p) =>
          searchQuery === "" ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const analysisPrompts = $derived(
    filteredPrompts.filter((p) => p.type === "analysis"),
  );
  const generationPrompts = $derived(
    filteredPrompts.filter((p) => p.type === "generation"),
  );
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">{m.admin_prompts_title()}</h1>
      <p class="text-muted-foreground mt-1">
        {m.admin_prompts_subtitle()}
      </p>
    </div>
    <Button onclick={() => (showCreateDialog = true)}>
      <PlusIcon class="mr-2 h-4 w-4" />
      {m.admin_prompts_create()}
    </Button>
  </div>

  <!-- Error Banner -->
  {#if error}
    <ErrorBanner message={error} />
  {/if}

  <!-- Filters -->
  <div class="flex flex-col sm:flex-row gap-4">
    <!-- Type Filter -->
    <div class="flex gap-2">
      <Button
        variant={selectedType === "all" ? "default" : "outline"}
        onclick={() => (selectedType = "all")}
      >
        {m.admin_prompts_filter_all()}
      </Button>
      <Button
        variant={selectedType === "analysis" ? "default" : "outline"}
        onclick={() => (selectedType = "analysis")}
      >
        {m.admin_prompts_filter_analysis()}
      </Button>
      <Button
        variant={selectedType === "generation" ? "default" : "outline"}
        onclick={() => (selectedType = "generation")}
      >
        {m.admin_prompts_filter_generation()}
      </Button>
    </div>

    <!-- Search -->
    <Input
      type="search"
      placeholder={m.admin_prompts_search_placeholder()}
      bind:value={searchQuery}
      class="max-w-sm"
    />
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div
      class="flex flex-col items-center justify-center py-12"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
      <span class="sr-only">{m.admin_prompts_loading()}</span>
    </div>
  {:else if filteredPrompts.length === 0}
    <!-- Empty State -->
    <Card>
      <CardContent class="pt-12 pb-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <FileTextIcon class="h-16 w-16 text-muted-foreground opacity-50" />
          <div>
            <p class="text-lg font-medium">{m.admin_prompts_empty()}</p>
            <p class="text-sm text-muted-foreground mt-1">
              {m.admin_prompts_empty_subtitle()}
            </p>
          </div>
          <Button onclick={() => (showCreateDialog = true)}>
            <PlusIcon class="mr-2 h-4 w-4" />
            {m.admin_prompts_empty_cta()}
          </Button>
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Prompts List -->
    <div class="space-y-8">
      {#if selectedType === "all" || selectedType === "analysis"}
        {#if analysisPrompts.length > 0}
          <div>
            <h2 class="text-xl font-semibold mb-4">
              {m.admin_prompts_section_analysis()}
            </h2>
            <div class="grid gap-4">
              {#each analysisPrompts as prompt (prompt.id)}
                <PromptCard
                  {prompt}
                  onToggleActive={handleToggleActive}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                  isToggleLoading={actionLoading[`toggle-${prompt.id}`] ||
                    false}
                  isDefaultLoading={actionLoading[`default-${prompt.id}`] ||
                    false}
                />
              {/each}
            </div>
          </div>
        {/if}
      {/if}

      {#if selectedType === "all" || selectedType === "generation"}
        {#if generationPrompts.length > 0}
          <div>
            <h2 class="text-xl font-semibold mb-4">
              {m.admin_prompts_section_generation()}
            </h2>
            <div class="grid gap-4">
              {#each generationPrompts as prompt (prompt.id)}
                <PromptCard
                  {prompt}
                  onToggleActive={handleToggleActive}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                  isToggleLoading={actionLoading[`toggle-${prompt.id}`] ||
                    false}
                  isDefaultLoading={actionLoading[`default-${prompt.id}`] ||
                    false}
                />
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<!-- Create Prompt Dialog -->
<CreatePromptDialog
  bind:open={showCreateDialog}
  onSuccess={handlePromptCreated}
/>
