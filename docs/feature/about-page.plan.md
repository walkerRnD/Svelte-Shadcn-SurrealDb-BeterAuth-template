# Página "Sobre" do projeto

Resumo: Criar uma página amigável de apresentação do template com foco em:
- Descrever o objetivo do projeto
- Mostrar como clonar com `tiged`
- Incluir botão para copiar o comando (área em destaque perto do topo, mas não no topo)

## Arquivos (criados/alterados)
- [x] src/routes/about/+page.svelte — página Sobre
- [x] src/lib/domain/+shared/ui/organisms/NavBar.svelte — link "Sobre" na navbar
- [x] src/routes/about/page.svelte.spec.ts — teste mínimo do título (Vitest Browser)

## Tarefas
- [x] Desenho simples e amigável usando shadcn Card/Button
- [x] Explicar o objetivo do template (Svelte 5 + shadcn + SurrealDB + BetterAuth)
- [x] Explicar que dá para copiar o projeto com `tiged` e exibir o comando
- [x] Botão para copiar o comando `tiged`
- [x] Área de cópia posicionada relativamente perto do topo (abaixo do título)
- [x] Adicionar teste de unidade do título da página
- [x] Validar em http://localhost:5173/about (Playwright MCP)

## Conteúdo do comando
- `npx tiged walkerRnD/Svelte-Shadcn-SurrealDb-BeterAuth-template my-app`

## Notas
- Siga Svelte 5 idioms (snippets, {@render}, DOM events como `onclick`)
- Manter consistência visual com os componentes shadcn já usados no projeto

## Referências
- docs/structure/01-basic-structure.plan.md
- .augment/rules/best-practice.md
- .augment/rules/spike.md