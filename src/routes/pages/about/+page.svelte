<script lang="ts">
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages.js";

  const repo = "walkerRnD/Svelte-Shadcn-SurrealDb-BeterAuth-template";
  const tigedCmd = `npx tiged ${repo} my-app`;

  let copied = $state(false);
  async function copyTiged() {
    try {
      await navigator.clipboard.writeText(tigedCmd);
      copied = true;
      setTimeout(() => (copied = false), 1200);
    } catch (e) {
      console.error(e);
      alert("Falha ao copiar");
    }
  }
</script>

<h1 class="text-xl font-semibold mb-4">{m.about_title()}</h1>

<!-- Highlighted copy area near the top (but not at the very top) -->
<Card class="mb-6">
  <CardHeader>
    <CardTitle>{m.about_tiged_title()}</CardTitle>
    <CardDescription>
      {m.about_tiged_desc()}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div class="grid gap-3">
      <code
        class="block w-full overflow-auto rounded-md border bg-muted/50 px-3 py-2 text-sm"
      >
        {tigedCmd}
      </code>
      <div class="flex items-center gap-2">
        <Button onclick={copyTiged} aria-label={m.about_tiged_copy_aria()}>
          {copied ? m.about_tiged_copied() : m.about_tiged_copy()}
        </Button>
        <a href="https://github.com/{repo}" target="_blank" rel="noreferrer">
          <Button variant="secondary">{m.about_repo_view()}</Button>
        </a>
      </div>
    </div>
  </CardContent>
  <CardFooter class="text-xs text-muted-foreground">
    {m.about_tip_change_name()}
  </CardFooter>
</Card>

<Card>
  <CardHeader>
    <CardTitle>{m.about_objective_title()}</CardTitle>
  </CardHeader>
  <CardContent class="grid gap-3 text-sm text-muted-foreground">
    <p>
      {m.about_objective_p1()}
    </p>
    <ul class="list-disc ml-5 grid gap-1">
      <li>{m.about_objective_list_ui()}</li>
      <li>{m.about_objective_list_auth()}</li>
      <li>{m.about_objective_list_db()}</li>
      <li>{m.about_objective_list_ddd()}</li>
      <li>{m.about_objective_list_tests()}</li>
    </ul>
  </CardContent>
</Card>
