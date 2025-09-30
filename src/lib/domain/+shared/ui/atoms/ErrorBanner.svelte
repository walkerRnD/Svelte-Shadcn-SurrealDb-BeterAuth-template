<script lang="ts">
  // Generic banner for error/info/success messages
  type Props = {
    message?: string;
    variant?: "error" | "info" | "success" | "warning";
    testId?: string;
  };
  let {
    message = "",
    variant = "error",
    testId = "error-banner",
  }: Props = $props();

  function classForVariant(v: Props["variant"]): string {
    const base = "text-sm rounded-md px-3 py-2 border";
    switch (v) {
      case "success":
        return `${base} text-green-700 bg-green-50 border-green-200`;
      case "info":
        return `${base} text-blue-700 bg-blue-50 border-blue-200`;
      case "warning":
        return `${base} text-yellow-800 bg-yellow-50 border-yellow-200`;
      default:
        return `${base} text-red-700 bg-red-50 border-red-200`;
    }
  }
</script>

{#if message}
  <div
    class={classForVariant(variant)}
    role={(variant === "error" ? "alert" : "status") as any}
    aria-live="polite"
    data-testid={testId}
  >
    {message}
  </div>
{/if}
