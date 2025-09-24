# 01 — Basic Structure Plan

## Goals
- Establish a clear, Svelte 5–aligned app structure using the domain-driven folders defined in rules
- Scaffold core UI routes and shared layout
- Define testing and environment conventions (Vitest, Jest, Playwright)
- Prepare authentication flows including an OAuth callback and Dev Login in non‑prod envs

## UI Routes (initial scope)
- / (home)
- /auth/login
- /auth/create-account
- /auth/reset-password
- /auth/logout
- /user/profile
- /user/account/change-password
- /user/account/delete-account
- /user/settings

## Project structure alignment
Follow domain-driven structure (aligning with vault pattern):
- src/lib/domain/+shared/ui/{atoms,molecules,organisms,layout,page}
- src/lib/domain/auth/{services,types,ui}
- src/lib/domain/user/{services,types,ui}
- src/lib/domain/+shared/{services,types,schema}
- Server/db helpers in src/lib/server

## Prerequisites (status update)
Core infrastructure
- ✗ jest.config.mjs — Jest configuration for server tests (still missing)
- ✓ src/lib/server/infra/db.ts — SurrealDB connection helper (✓ createDbConnection, ✓ getDb)
- ✓ src/lib/server/conf/server.config.ts — Environment configuration (✓ DB_CONFIG)
- ✓ src/lib/server/infra/auth.ts — Better Auth configuration (✓ getAuth function)
- ✓ src/lib/shared-utils/auth/better-auth.adapter.ts — SurrealDB adapter (✓ exists!)
- ✓ src/lib/shared-utils/auth/better-auth.service.ts — SurrealDB service (✓ exists!)
- ✗ src/hooks.server.ts — Update to include auth middleware (only has paraglide)
- ✗ src/app.d.ts — Add auth types to App.Locals (needs auth session types)
- ✗ getAuthUser helper function — Extract user from locals (missing)

## Files to create/update (remaining work)
**Critical missing pieces:**
- src/lib/server/auth-helpers.ts — getAuthUser() and auth utilities
- jest.config.mjs — Jest configuration for server tests
- src/hooks.server.ts — Add auth middleware (currently only has paraglide)

**UI and layout**
- src/routes/+layout.svelte — Update to use AppShell and auth context
- src/lib/domain/+shared/ui/layout/AppShell.svelte — layout, header/footer, slot for pages
- src/lib/domain/+shared/ui/organisms/NavBar.svelte — top navigation with auth state
- src/routes/+page.svelte — Update home page with auth-aware content

**Auth pages**
- src/routes/auth/login/+page.svelte
- src/routes/auth/create-account/+page.svelte
- src/routes/auth/reset-password/+page.svelte
- src/routes/auth/logout/+server.ts — POST to clear session

**User pages (auth-protected)**
- src/routes/user/profile/+page.svelte
- src/routes/user/account/change-password/+page.svelte
- src/routes/user/account/delete-account/+page.svelte
- src/routes/user/settings/+page.svelte

**APIs and services**
- src/routes/api/auth/[...auth]/+server.ts — Better Auth handler
- src/lib/domain/auth/services/AuthService.ts — login/logout/oauth helpers
- src/lib/domain/user/services/UserService.ts — profile/settings helpers (with DI pattern)
- src/lib/domain/+shared/schema/auth.ts — zod schemas for auth forms

**Types**
- src/lib/domain/auth/types/auth.ts — UI/Auth types (e.g., UIUser)
- src/lib/domain/user/types/user.ts — user profile types
- src/lib/server/types.ts — Server-side types (StringRecordId, etc.)

## Svelte 5 UI patterns (must‑follow)
- Prefer snippet props and {@render} over legacy slots
- Use DOM event attributes (onclick, oninput, onsubmit) instead of on:click
- Prefer callback props to createEventDispatcher

## Environments
- DEV (npm run dev): DB_HOST=surrealkv://data.db
- TEST (npm run preview during e2e and jest): DB_HOST=mem://test.db
- LOCAL/TEST/DEV: show a Dev Login button to enable deterministic login for E2E and AI

## Auth: OAuth Provider
- Google callback URL: <origin>/api/oauth/google/callback

## Scripts (to verify or add)
Current scripts (✓ = exists, ✗ = missing):
- ✓ "test:unit": "vitest"
- ✗ "test:server": "jest --config jest.config.mjs" (missing jest.config.mjs)
- ✓ "preview": "vite preview"
- ✓ "test:e2e": "set NODE_ENV=test && npm run preview && playwright test"
- ✗ "preview:test": "set NODE_ENV=test && vite preview"
- ✗ "preview:test-non-block": "set NODE_ENV=test && vite preview --strictPort=false --port=5173 &"

**Script fixes needed:**
- Playwright config uses port 4173 but plan assumes 5173 — align to 5173
- Add missing jest.config.mjs file
- Add missing preview:test scripts

Notes
- Use Playwright for E2E on npm run preview:test (non-block if running UI live)
- Frontend uses Vitest; backend uses Jest with Surreal mem DB for isolation

## Dependencies to install
- better-auth (authentication)
- surrealdb.js (database client)
- zod (schema validation)

## Validation (must do)
- Start preview in test mode, then run Playwright
- Use Playwright MCP to validate UI at http://localhost:5173/
- Confirm: pages load, Dev Login visible in non‑prod, basic navigation works
- Test auth flow: login → protected route → logout

## Acceptance checklist
**Phase 1: Infrastructure** (mostly complete!)
- [x] DB helper (getDb) available — ✓ src/lib/server/infra/db.ts
- [x] Server config with environment variables — ✓ src/lib/server/conf/server.config.ts
- [x] Better Auth configuration — ✓ src/lib/server/infra/auth.ts (getAuth function)
- [x] SurrealDB adapter for Better Auth — ✓ src/lib/shared-utils/auth/better-auth.adapter.ts
- [x] SurrealDB service for Better Auth — ✓ src/lib/shared-utils/auth/better-auth.service.ts
- [ ] Dependencies installed (better-auth, surrealdb.js, zod)
- [ ] jest.config.mjs created and working
- [ ] getAuthUser helper function — src/lib/server/auth-helpers.ts
- [ ] Auth middleware in hooks.server.ts (currently only paraglide)
- [ ] Scripts fixed (playwright port, preview:test variants)

**Phase 2: Structure & UI**
- [ ] Domain folder structure created
- [ ] App shell and NavBar scaffolded and rendered across routes
- [ ] All listed routes created with minimal content
- [ ] Dev Login visible when NODE_ENV in {development,test,local}

**Phase 3: Integration**
- [ ] Auth flow working (login → protected route → logout)
- [ ] Services follow DI pattern with owner scoping
- [ ] Vitest/Jest/Playwright scripts present and runnable
- [ ] TEST uses DB_HOST=mem://test.db; DEV uses DB_HOST=surrealkv://data.db

**Phase 4: Validation**
- [ ] Playwright MCP validation performed at http://localhost:5173/
- [ ] All routes accessible and functional
- [ ] Auth state properly managed across navigation

## Implementation notes (scaffold excerpts)
Current Better Auth setup (✓ exists):
```ts
// src/lib/server/infra/auth.ts (✓ implemented)
import { betterAuth } from "better-auth";
import { surrealAdapter } from "../../shared-utils/auth/better-auth.adapter";

export function getAuth() {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
    emailAndPassword: { enabled: true },
    database: surrealAdapter, // ✗ missing adapter
  });
}
```

Existing SurrealDB adapter (✓ implemented):
```ts
// src/lib/shared-utils/auth/better-auth.adapter.ts (✓ exists)
import type { Adapter, BetterAuthOptions } from "better-auth/types";
import { getDb } from "../../server/infra/db";
import { BetterAuthService } from "./better-auth.service";

export const surrealAdapter = (options: BetterAuthOptions): Adapter => {
  return new BetterAuthService(getDb, options);
};
```

Svelte 5 snippet usage in shared UI:
```svelte
<script lang="ts">
  type Props = { header?: Snippet<[]> };
  let { header }: Props = $props();
</script>
<header>{@render header?.()}</header>
<slot />
```

## Implementation order (updated based on current state)
1. **Complete infrastructure**:
   - Install missing deps (better-auth, surrealdb.js, zod)
   - Create SurrealDB adapter for Better Auth
   - Add getAuthUser helper and auth middleware
   - Create jest.config.mjs, fix scripts
2. **Domain structure**: Create folder hierarchy, base types
3. **UI scaffold**: AppShell, NavBar, basic routes
4. **Auth integration**: Login flow, protected routes, dev login
5. **Testing & validation**: E2E tests, Playwright MCP verification

## Current status summary
✅ **Completed (major infrastructure):**
- SurrealDB connection (src/lib/server/infra/db.ts)
- Server configuration (src/lib/server/conf/server.config.ts)
- Better Auth setup function (src/lib/server/infra/auth.ts)
- SurrealDB adapter for Better Auth (src/lib/shared-utils/auth/better-auth.adapter.ts)
- Better Auth service implementation (src/lib/shared-utils/auth/better-auth.service.ts)

❌ **Still needed:**
- Dependencies installation (better-auth, surrealdb.js, zod)
- Auth middleware integration in hooks.server.ts
- getAuthUser helper function
- Jest configuration
- Domain structure and UI components
- API routes for auth endpoints

## References
- .augment/rules/spike.md (plan and validation playbook)
- .augment/rules/best-practice.md and AGENTS.md (Svelte 5 idioms, testing)
- .augment/knowledge/server-services-architecture.md (DI patterns, owner scoping)
- Better Auth docs: https://www.better-auth.com/
- SurrealDB docs: https://surrealdb.com/docs
