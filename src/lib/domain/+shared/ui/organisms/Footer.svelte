<script lang="ts">
  import * as m from "$lib/paraglide/messages";

  const currentYear = new Date().getFullYear();
</script>

<div class="flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
  <p class="text-muted-foreground">
    {m.footer_copyright({ year: currentYear.toString() })}
  </p>
  <nav class="flex gap-4">
    <a
      href="/pages/privacy-policy"
      class="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
    >
      {m.footer_privacy()}
    </a>
    <a
      href="/pages/terms-of-service"
      class="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
    >
      {m.footer_terms()}
    </a>
  </nav>
</div>

