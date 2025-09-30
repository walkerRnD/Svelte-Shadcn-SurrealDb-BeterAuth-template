<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "$lib/components/ui/select";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import { m } from "$lib/paraglide/messages.js";

  type Props = {
    open: boolean;
    onSuccess: () => void;
  };

  let { open = $bindable(), onSuccess }: Props = $props();

  let name = $state('');
  let description = $state('');
  let type = $state<'analysis' | 'generation'>('analysis');
  let promptText = $state('');
  let tags = $state('');
  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  function resetForm() {
    name = '';
    description = '';
    type = 'analysis';
    promptText = '';
    tags = '';
    error = null;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;
    error = null;

    try {
      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          type,
          prompt_text: promptText,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || m.admin_prompt_create_error());
      }

      resetForm();
      onSuccess();
    } catch (e: any) {
      error = e.message || m.admin_prompt_create_error();
      console.error('Create prompt error:', e);
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    resetForm();
    open = false;
  }

  // Reset form when dialog closes
  $effect(() => {
    if (!open) {
      resetForm();
    }
  });
</script>

<Dialog bind:open>
  <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{m.admin_prompt_create_title()}</DialogTitle>
      <DialogDescription>
        {m.admin_prompt_create_subtitle()}
      </DialogDescription>
    </DialogHeader>

    <form onsubmit={handleSubmit} class="space-y-4">
      <!-- Name -->
      <div class="space-y-2">
        <Label for="name">{m.admin_prompt_field_name()} *</Label>
        <Input
          id="name"
          bind:value={name}
          placeholder={m.admin_prompt_field_name_placeholder()}
          required
          minlength={3}
          maxlength={100}
          disabled={isSubmitting}
        />
      </div>

      <!-- Type -->
      <div class="space-y-2">
        <Label for="type">{m.admin_prompt_field_type()} *</Label>
        <Select bind:value={type}>
          <SelectTrigger id="type" disabled={isSubmitting}>
            <SelectValue placeholder={m.admin_prompt_field_type_placeholder()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="analysis">{m.admin_prompts_filter_analysis()}</SelectItem>
            <SelectItem value="generation">{m.admin_prompts_filter_generation()}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <Label for="description">{m.admin_prompt_field_description()}</Label>
        <Textarea
          id="description"
          bind:value={description}
          placeholder={m.admin_prompt_field_description_placeholder()}
          rows={2}
          maxlength={500}
          disabled={isSubmitting}
        />
      </div>

      <!-- Prompt Text -->
      <div class="space-y-2">
        <Label for="prompt_text">{m.admin_prompt_field_prompt_text()} *</Label>
        <Textarea
          id="prompt_text"
          bind:value={promptText}
          placeholder={m.admin_prompt_field_prompt_text_placeholder()}
          rows={8}
          required
          minlength={10}
          class="font-mono text-sm"
          disabled={isSubmitting}
        />
      </div>

      <!-- Tags -->
      <div class="space-y-2">
        <Label for="tags">{m.admin_prompt_field_tags()}</Label>
        <Input
          id="tags"
          bind:value={tags}
          placeholder={m.admin_prompt_field_tags_placeholder()}
          disabled={isSubmitting}
        />
        <p class="text-xs text-muted-foreground">
          {m.admin_prompt_field_tags_help()}
        </p>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="bg-destructive/10 text-destructive p-3 rounded-md text-sm" role="alert">
          {error}
        </div>
      {/if}

      <!-- Footer -->
      <DialogFooter>
        <Button type="button" variant="outline" onclick={handleCancel} disabled={isSubmitting}>
          {m.admin_prompt_create_cancel()}
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {#if isSubmitting}
            <LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
            <span class="sr-only">{m.admin_prompt_create_submitting()}</span>
          {/if}
          {isSubmitting ? m.admin_prompt_create_submitting() : m.admin_prompt_create_submit()}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

