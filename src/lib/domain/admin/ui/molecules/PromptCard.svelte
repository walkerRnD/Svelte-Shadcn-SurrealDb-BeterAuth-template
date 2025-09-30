<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge";
  import { Switch } from "$lib/components/ui/switch";
  import StarIcon from "@lucide/svelte/icons/star";
  import TrashIcon from "@lucide/svelte/icons/trash-2";
  import BarChartIcon from "@lucide/svelte/icons/bar-chart";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import type { UIPromptPublic } from "$lib/domain/admin/types/prompt";
  import { m } from "$lib/paraglide/messages.js";

  type Props = {
    prompt: UIPromptPublic;
    onToggleActive: (promptId: string, isActive: boolean) => void;
    onSetDefault: (promptId: string, type: "analysis" | "generation") => void;
    onDelete: (promptId: string) => void;
    isToggleLoading?: boolean;
    isDefaultLoading?: boolean;
  };

  let {
    prompt,
    onToggleActive,
    onSetDefault,
    onDelete,
    isToggleLoading = false,
    isDefaultLoading = false,
  }: Props = $props();

  let showDeleteDialog = $state(false);
  let isDeleting = $state(false);

  function handleToggle() {
    onToggleActive(prompt.id, !prompt.is_active);
  }

  function handleSetDefault() {
    onSetDefault(prompt.id, prompt.type);
  }

  async function handleDeleteConfirm() {
    isDeleting = true;
    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || m.admin_prompts_error_delete());
      }

      showDeleteDialog = false;
      onDelete(prompt.id);
    } catch (e: any) {
      console.error("Delete error:", e);
      alert(e.message || m.admin_prompts_error_delete());
    } finally {
      isDeleting = false;
    }
  }
</script>

<Card>
  <CardHeader>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <CardTitle>{prompt.name}</CardTitle>
          {#if prompt.is_default}
            <Badge variant="default" class="flex items-center gap-1">
              <StarIcon class="h-3 w-3" />
              {m.admin_prompt_badge_default()}
            </Badge>
          {/if}
          <Badge variant={prompt.type === "analysis" ? "secondary" : "outline"}>
            {prompt.type === "analysis"
              ? m.admin_prompts_filter_analysis()
              : m.admin_prompts_filter_generation()}
          </Badge>
        </div>
        {#if prompt.description}
          <CardDescription class="mt-2">{prompt.description}</CardDescription>
        {/if}
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div class="space-y-4">
      <!-- Prompt Text Preview -->
      <div class="bg-muted p-3 rounded-md">
        <p class="text-sm font-mono line-clamp-3">{prompt.prompt_text}</p>
      </div>

      <!-- Tags -->
      {#if prompt.tags && prompt.tags.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each prompt.tags as tag}
            <Badge variant="outline" class="text-xs">{tag}</Badge>
          {/each}
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2 border-t">
        <div class="flex items-center gap-4">
          <!-- Active Toggle -->
          <div class="flex items-center gap-2">
            <Switch
              checked={prompt.is_active}
              onCheckedChange={handleToggle}
              id={`active-${prompt.id}`}
              disabled={isToggleLoading}
            />
            <label
              for={`active-${prompt.id}`}
              class="text-sm font-medium cursor-pointer"
            >
              {#if isToggleLoading}
                <LoaderIcon class="h-4 w-4 animate-spin inline" />
              {:else}
                {prompt.is_active
                  ? m.admin_prompt_status_active()
                  : m.admin_prompt_status_inactive()}
              {/if}
            </label>
          </div>

          <!-- Set as Default Button -->
          {#if !prompt.is_default}
            <Button
              variant="outline"
              size="sm"
              onclick={handleSetDefault}
              disabled={!prompt.is_active || isDefaultLoading}
              aria-label={m.admin_prompt_action_set_default()}
            >
              {#if isDefaultLoading}
                <LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
              {:else}
                <StarIcon class="mr-2 h-4 w-4" />
              {/if}
              {m.admin_prompt_action_set_default()}
            </Button>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <!-- Analytics Button -->
          <Button
            variant="ghost"
            size="sm"
            href={`/admin/prompts/${prompt.id}/analytics`}
            aria-label={m.admin_prompt_action_analytics()}
          >
            <BarChartIcon class="mr-2 h-4 w-4" />
            {m.admin_prompt_action_analytics()}
          </Button>

          <!-- Delete Button -->
          <Button
            variant="ghost"
            size="sm"
            onclick={() => (showDeleteDialog = true)}
            class="text-destructive"
            aria-label={m.admin_prompt_action_delete()}
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{m.admin_prompts_delete_confirm()}</DialogTitle>
      <DialogDescription>
        {m.admin_prompts_delete_description({ name: prompt.name })}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => (showDeleteDialog = false)}
        disabled={isDeleting}
      >
        {m.admin_prompt_create_cancel()}
      </Button>
      <Button
        variant="destructive"
        onclick={handleDeleteConfirm}
        disabled={isDeleting}
        aria-busy={isDeleting}
      >
        {#if isDeleting}
          <LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {m.admin_prompt_action_delete()}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
