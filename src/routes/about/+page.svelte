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

<h1 class="text-xl font-semibold mb-4">Sobre o Projeto</h1>

<!-- Highlighted copy area near the top (but not at the very top) -->
<Card class="mb-6">
  <CardHeader>
    <CardTitle>Comece em segundos com tiged</CardTitle>
    <CardDescription>
      Você pode clonar este template diretamente do GitHub usando o comando abaixo.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div class="grid gap-3">
      <code class="block w-full overflow-auto rounded-md border bg-muted/50 px-3 py-2 text-sm">
        {tigedCmd}
      </code>
      <div class="flex items-center gap-2">
        <Button onclick={copyTiged} aria-label="Copiar comando tiged">
          {copied ? "Copiado!" : "Copiar comando"}
        </Button>
        <a href="https://github.com/{repo}" target="_blank" rel="noreferrer">
          <Button variant="secondary">Ver repositório</Button>
        </a>
      </div>
    </div>
  </CardContent>
  <CardFooter class="text-xs text-muted-foreground">
    Dica: troque "my-app" pelo nome do seu projeto.
  </CardFooter>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Objetivo</CardTitle>
  </CardHeader>
  <CardContent class="grid gap-3 text-sm text-muted-foreground">
    <p>
      Este projeto é um template pronto para acelerar a construção de apps
      modernos com SvelteKit 5, shadcn-svelte, SurrealDB e BetterAuth.
      Ele já vem com layout, autenticação por e‑mail/senha, páginas base e
      componentes de UI consistentes.
    </p>
    <ul class="list-disc ml-5 grid gap-1">
      <li>UI com shadcn-svelte (botões, cards, formulários)</li>
      <li>Autenticação com BetterAuth (e2e‑friendly)</li>
      <li>Banco com SurrealDB (adapter configurado)</li>
      <li>Estrutura de pastas alinhada ao DDD do projeto</li>
      <li>Testes: Vitest (frontend) e Jest (backend), E2E com Playwright</li>
    </ul>
  </CardContent>
</Card>

