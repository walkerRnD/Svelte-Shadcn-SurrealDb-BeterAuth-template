<script lang="ts">
  import {
    calculatePasswordStrength,
    type PasswordStrength,
  } from "../utils/passwordStrength";
  import CheckIcon from "@lucide/svelte/icons/check";
  import XIcon from "@lucide/svelte/icons/x";
  import { m } from "$lib/paraglide/messages.js";

  // 📌 declare types separately
  type Props = {
    password: string;
    showRequirements?: boolean;
  };

  // 📌 apply types to object
  let { password, showRequirements = true }: Props = $props();

  const strength: PasswordStrength = $derived(
    calculatePasswordStrength(password, {
      tooWeak: m.password_strength_too_weak(),
      weak: m.password_strength_weak(),
      medium: m.password_strength_medium(),
      strong: m.password_strength_strong(),
      veryStrong: m.password_strength_very_strong(),
      reqMinLength: m.password_req_min_length(),
      reqUppercase: m.password_req_uppercase(),
      reqLowercase: m.password_req_lowercase(),
      reqNumber: m.password_req_number(),
      reqSpecial: m.password_req_special(),
    }),
  );
</script>

{#if password}
  <div class="space-y-2">
    <!-- Strength bar -->
    <div class="flex gap-1">
      {#each Array(5) as _, i}
        <div
          class="h-1 flex-1 rounded-full transition-colors {i < strength.score
            ? strength.color
            : 'bg-gray-200 dark:bg-gray-700'}"
        ></div>
      {/each}
    </div>

    <!-- Strength label -->
    <p class="text-xs text-muted-foreground">
      {m.password_strength_label()}
      <span class="font-medium">{strength.label}</span>
    </p>

    <!-- Requirements checklist -->
    {#if showRequirements}
      <ul class="space-y-1 text-xs">
        {#each strength.requirements as req}
          <li class="flex items-center gap-1.5">
            {#if req.met}
              <CheckIcon
                class="h-3.5 w-3.5 text-green-600 dark:text-green-400"
              />
              <span class="text-green-600 dark:text-green-400">{req.label}</span
              >
            {:else}
              <XIcon class="h-3.5 w-3.5 text-gray-400" />
              <span class="text-muted-foreground">{req.label}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
