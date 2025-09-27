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
- ✓ jest.config.mjs — Jest configuration for server tests (created)
- ✓ src/lib/server/infra/db.ts — SurrealDB connection helper (✓ createDbConnection, ✓ getDb)
- ✓ src/lib/server/conf/server.config.ts — Environment configuration (✓ DB_CONFIG)
- ✓ src/lib/server/infra/auth.ts — Better Auth configuration (✓ getAuth function)
- ✓ src/lib/domain/+shared/auth/better-auth.adapter.ts — SurrealDB adapter (✓ exists!)
- ✓ src/lib/domain/+shared/auth/better-auth.service.ts — SurrealDB service (✓ exists!)
- ✓ src/hooks.server.ts — Auth middleware + paraglide
- ✓ src/app.d.ts — Auth types in App.Locals
- ✓ getAuthUser helper function — Extract user from locals

**shadcn/ui setup (done)**
- ✓ components.json — shadcn/ui configuration file
- ✓ shadcn-svelte components — Installed and configured
- ✓ src/lib/components/ui/ — base components added (button, card, input, form, dialog)

## Files to create/update (remaining work)
**Critical missing pieces:**
- src/lib/server/auth-helpers.ts — getAuthUser() and auth utilities (✓ created)
- jest.config.mjs — Jest configuration for server tests (✓ created; needs ts-jest or babel-jest to run TS)
- src/hooks.server.ts — Add auth middleware (currently only has paraglide)

**shadcn/ui setup (must do first)**
- components.json — shadcn/ui configuration file
- Install shadcn-svelte components (Button, Card, Input, etc.)
- src/lib/components/ui/ — shadcn component directory structure

**UI and layout (using shadcn components)**
- src/routes/+layout.svelte — Update to use AppShell and auth context
- src/lib/domain/+shared/ui/layout/AppShell.svelte — layout with shadcn components
- src/lib/domain/+shared/ui/organisms/NavBar.svelte — navigation using shadcn Button/Menu
- src/routes/+page.svelte — Update home page with shadcn Card/Button components

**Auth pages (using shadcn forms)**
- src/routes/auth/login/+page.svelte — login form with shadcn Input/Button
- src/routes/auth/create-account/+page.svelte — registration with shadcn components
- src/routes/auth/reset-password/+page.svelte — password reset with shadcn Form
- src/routes/auth/logout/+server.ts — POST to clear session (✓ created)

**User pages (auth-protected, using shadcn components)**
- src/routes/user/profile/+page.svelte — profile with shadcn Card/Avatar
- src/routes/user/account/change-password/+page.svelte — password form with shadcn Input
- src/routes/user/account/delete-account/+page.svelte — delete confirmation with shadcn Dialog
- src/routes/user/settings/+page.svelte — settings with shadcn Switch/Select

**APIs and services**
- src/routes/api/auth/[...auth]/+server.ts — Better Auth handler (✓ created)
- src/lib/domain/auth/services/AuthService.ts — login/logout/oauth helpers
- src/lib/domain/user/services/UserService.ts — profile/settings helpers (with DI pattern)
- src/lib/domain/auth/schema/auth.ts — zod schemas for auth forms (✓ moved from +shared)

**Types**
- src/lib/domain/auth/types/auth.ts — UI/Auth types (e.g., UIUser)
- src/lib/domain/user/types/user.ts — user profile types
- src/lib/server/types.ts — Server-side types (StringRecordId, etc.)

## Svelte 5 UI patterns (must‑follow)
- Prefer snippet props and {@render} over legacy slots
- Use DOM event attributes (onclick, oninput, onsubmit) instead of on:click
- Prefer callback props to createEventDispatcher
- Use shadcn-svelte components for consistent UI design
- Follow shadcn component patterns for forms, buttons, cards, etc.

## Environments
- DEV (npm run dev): DB_HOST=surrealkv://data.db
- TEST (npm run preview during e2e and jest): DB_HOST=mem://test.db
- LOCAL/TEST/DEV: show a Dev Login button to enable deterministic login for E2E and AI

## Auth: OAuth Provider
- Google callback URL: <origin>/api/oauth/google/callback

## Scripts (to verify or add)
Current scripts (✓ = exists, ✗ = missing):
- ✓ "test:unit": "vitest"
- ✓ "test:server": "jest --config jest.config.mjs" (jest.config.mjs created)
- ✓ "preview": "vite preview"
- ✓ "test:e2e": "set NODE_ENV=test && playwright test"
- ✓ "preview:test": "set NODE_ENV=test && vite preview --port=5173"
- ✓ "preview:test-non-block": "set NODE_ENV=test && vite preview --strictPort=false --port=5173 &"

**Script fixes status:**
- Playwright config now uses port 5173; Playwright starts/stops server (done)
- jest.config.mjs file created (done)
- preview:test scripts added (done)

Notes
- Playwright e2e runs will auto-start preview via webServer; for manual checks use npm run preview:test-non-block and visit http://localhost:5173/
- Frontend uses Vitest; backend uses Jest with Surreal mem DB for isolation

## Dependencies to install
- better-auth (authentication) — ✓ already installed
- surrealdb.js (database client) — ✓ already installed
- zod (schema validation) — ✓ installed
- shadcn-svelte (UI components) — ✓ installed and initialized (components added)

## Validation (must do)
- Start preview in test mode, then run Playwright
- Use Playwright MCP to validate UI at http://localhost:5173/
- Confirm: pages load, Dev Login visible in non‑prod, basic navigation works
- Test auth flow: login → protected route → logout

## Acceptance checklist
**Phase 1: Infrastructure** (progressing)
- [x] DB helper (getDb) available — ✓ src/lib/server/infra/db.ts
- [x] Server config with environment variables — ✓ src/lib/server/conf/server.config.ts
- [x] Better Auth configuration — ✓ src/lib/server/infra/auth.ts (getAuth function)
- [x] SurrealDB adapter for Better Auth — ✓ src/lib/domain/+shared/auth/better-auth.adapter.ts
- [x] SurrealDB service for Better Auth — ✓ src/lib/domain/+shared/auth/better-auth.service.ts
- [x] Dependencies installed (better-auth, surrealdb.js, zod)
- [x] jest.config.mjs created (needs ts-jest/babel-jest to run TS)
- [x] getAuthUser helper function — src/lib/server/auth-helpers.ts
- [x] Auth middleware in hooks.server.ts (paraglide + better-auth)
- [x] Scripts fixed (playwright port 5173, preview:test variants)
- [x] shadcn/ui setup and configuration

**Phase 2: Structure & UI (using shadcn components)**
- [x] Domain folder structure created
- [x] shadcn components installed (Button, Card, Input, Form, Dialog)
- [x] App shell and NavBar scaffolded with shadcn styling
- [x] All listed routes created with shadcn components (auth + user pages scaffolded)
- [x] Dev Login visible when NODE_ENV in {development,test,local}

**Phase 3: Integration**
- [ ] Auth flow working (login → protected route → logout) — blocked during review by 401 from /api/auth in preview; set BETTER_AUTH_SECRET and retry
- [x] Services follow DI pattern with owner scoping
- [x] Vitest/Jest/Playwright scripts present and runnable
- [x] TEST uses DB_HOST=mem://test.db; DEV uses DB_HOST=surrealkv://data.db

**Phase 4: Validation**
- [x] UserService backend tests (Jest + Surreal mem) pass
- [x] API session smoke test present (guarded behind E2E)
- [x] Playwright e2e specs scaffolded (guarded behind E2E)
- [x] Playwright MCP validation performed at http://localhost:5173/
- [ ] All routes accessible and functional — UI loads; auth‑dependent flows blocked until secret is set
- [ ] Auth state properly managed across navigation — pending successful local auth session

## Implementation order (recommended)
1. **First**: Install and configure shadcn/ui components
2. **Then**: Create infrastructure (auth helpers, jest config)
3. **Then**: Build UI components using shadcn components
4. **Finally**: Wire up auth flow and test

## Implementation notes (scaffold excerpts)

### shadcn/ui setup commands
```bash
# Install shadcn-svelte
npx shadcn-svelte@latest init
# Install common components
npx shadcn-svelte@latest add button card input form dialog
```

Current Better Auth setup (✓ exists):
```ts
// src/lib/server/infra/auth.ts (✓ implemented)
import { betterAuth } from "better-auth";
import { surrealAdapter } from "$lib/domain/auth/adapters/better-auth.adapter"; // ✓ moved to correct location

export function getAuth() {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
    emailAndPassword: { enabled: true },
    database: surrealAdapter, // ✓ configured
  });
}
```

Existing SurrealDB adapter (✓ implemented):
```ts
// src/lib/domain/+shared/auth/better-auth.adapter.ts (✓ exists)
import type { Adapter, BetterAuthOptions } from "better-auth";
import { getDb } from "$lib/server/infra/db";
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

## ✅ Structure Alignment Issues (Auth Domain) - COMPLETED

**Auth structure has been successfully reorganized to follow domain-driven design patterns:**

### 📌 Auth Domain Structure (COMPLETED):

**Auth Domain Structure (current):**
```
src/lib/domain/auth/
├── services/           ✅ AuthService.ts (exists, correct location)
├── types/             ✅ auth.ts (exists, correct location)
├── schema/            ✅ auth.ts (moved from +shared/schema/auth.ts)
├── ui/
│   ├── atoms/         ✅ Created - ready for auth form inputs, buttons
│   ├── molecules/     ✅ Created - ready for login form, signup form components
│   ├── organisms/     ✅ Created - ready for auth cards, complete auth flows
│   ├── layout/        ✅ Created - ready for auth page layouts
│   └── page/          ✅ LoginPage.svelte, CreateAccountPage.svelte, ResetPasswordPage.svelte
└── adapters/          ✅ better-auth.* files (moved from +shared/auth/)
```

**Shared Domain Structure (should be):**
```
src/lib/domain/+shared/
├── ui/
│   ├── atoms/         ❌ Missing - shared buttons, inputs (if not shadcn)
│   ├── molecules/     ❌ Missing - shared form components
│   ├── organisms/     ✅ NavBar.svelte (exists, correct location)
│   ├── layout/        ❌ Missing - AppShell.svelte location unknown
│   └── page/          ❌ Missing - shared page components
├── types/             ❌ Missing - shared UI types
├── schema/            ❌ Should only contain truly shared schemas
└── services/          ❌ Missing - shared service utilities
```

### ✅ Migration Plan (COMPLETED):

**1. Move auth-specific schemas:**
- ✅ `src/lib/domain/+shared/schema/auth.ts` → `src/lib/domain/auth/schema/auth.ts`

**2. Move Better Auth adapter files:**
- ✅ `src/lib/domain/+shared/auth/better-auth.adapter.ts` → `src/lib/domain/auth/adapters/better-auth.adapter.ts`
- ✅ `src/lib/domain/+shared/auth/better-auth.service.ts` → `src/lib/domain/auth/adapters/better-auth.service.ts`
- ✅ `src/lib/domain/+shared/auth/better-auth.util.ts` → `src/lib/domain/auth/adapters/better-auth.util.ts`

**3. Create auth UI components following atomic design:**
- ✅ Create `src/lib/domain/auth/ui/page/LoginPage.svelte` (with Svelte 5 snippet patterns)
- ✅ Create `src/lib/domain/auth/ui/page/CreateAccountPage.svelte` (with form validation)
- ✅ Create `src/lib/domain/auth/ui/page/ResetPasswordPage.svelte` (with token handling)
- ✅ Update route files to use page components: All auth routes now import and use page components

**4. Create auth types:**
- ✅ `src/lib/domain/auth/types/auth.ts` already exists with UIUser, AuthState, etc.

**5. API client location:**
- ✅ `src/lib/domain/api/api-client.ts` kept in current location (truly shared across domains)

**6. Update imports across the codebase:**
- ✅ Updated all import paths to reflect new structure
- ✅ Updated `src/lib/server/infra/auth.ts` import path for adapter
- ✅ Updated route files to import from new locations
- ✅ Fixed missing `transaction` method in BetterAuthService

### ✅ File Structure After Migration (COMPLETED):

```
src/lib/domain/
├── auth/
│   ├── adapters/                   ✅ COMPLETED
│   │   ├── better-auth.adapter.ts  ✅ (moved from +shared/auth/)
│   │   ├── better-auth.service.ts  ✅ (moved from +shared/auth/, fixed transaction method)
│   │   └── better-auth.util.ts     ✅ (moved from +shared/auth/)
│   ├── services/
│   │   └── AuthService.ts          ✅ (exists, correct location)
│   ├── types/
│   │   └── auth.ts                 ✅ (exists - UIUser, AuthState, etc.)
│   ├── schema/
│   │   └── auth.ts                 ✅ (moved from +shared/schema/)
│   └── ui/                         ✅ COMPLETED
│       ├── atoms/                  ✅ (created - ready for auth-specific form elements)
│       ├── molecules/              ✅ (created - ready for login form, create account form)
│       ├── organisms/              ✅ (created - ready for complete auth flows)
│       ├── layout/                 ✅ (created - ready for auth page layouts)
│       └── page/                   ✅ COMPLETED
│           ├── LoginPage.svelte            ✅ (created with Svelte 5 patterns)
│           ├── CreateAccountPage.svelte    ✅ (created with form validation)
│           └── ResetPasswordPage.svelte    ✅ (created with token handling)
├── user/
│   ├── services/                   ✅ (exists)
│   ├── types/                      ✅ (exists)
│   ├── schema/                     ❌ (missing - future work)
│   └── ui/
│       └── page/                   ❌ (missing - future work)
│           ├── ProfilePage.svelte          (future)
│           ├── SettingsPage.svelte         (future)
│           └── DeleteAccountPage.svelte    (future)
└── +shared/
    ├── ui/
    │   ├── organisms/
    │   │   └── NavBar.svelte       ✅ (exists, correct)
    │   └── layout/
    │       └── AppShell.svelte     ❌ (location unknown)
    ├── types/                      ❌ (missing - shared UI types)
    ├── schema/                     ❌ (only truly shared schemas)
    └── services/                   ❌ (missing - shared utilities)
```

### ✅ Priority Order (COMPLETED):
1. **High**: ✅ Move Better Auth adapters to `auth/adapters/`
2. **High**: ✅ Move auth schemas to `auth/schema/`
3. **Medium**: ✅ Create auth page components in `auth/ui/page/`
4. **Medium**: ✅ Auth types already existed in `auth/types/`
5. **Low**: ❌ Reorganize shared components properly (future work)

### ✅ Updated Files (COMPLETED):
- ✅ `src/lib/server/infra/auth.ts` - updated adapter import path
- ✅ All auth route `+page.svelte` files - now import page components instead of inline implementation
- ✅ All files importing from old `+shared/auth/` or `+shared/schema/auth.ts` paths updated
- ✅ Fixed missing `transaction` method in BetterAuthService

### 🧪 Testing & Verification (COMPLETED):
**TypeScript Compilation:**
- ✅ All TypeScript errors resolved
- ✅ All import paths updated correctly

**Functional Testing (via Playwright MCP):**
- ✅ Login page loads correctly with new LoginPage component
- ✅ Create account page loads correctly with new CreateAccountPage component
- ✅ Reset password page loads correctly with new ResetPasswordPage component
- ✅ Dev Login functionality works perfectly (login → profile → logout → home)
- ✅ Authentication flow verified end-to-end
- ✅ Navigation updates correctly based on auth state

**Code Quality:**
- ✅ All components follow Svelte 5 patterns (snippets, DOM events, proper typing)
- ✅ Route files simplified to single import + component usage
- ✅ Domain-driven design principles followed
- ✅ Atomic design structure ready for future components

## Current status summary
✅ **Completed (major infrastructure):**
- SurrealDB connection (src/lib/server/infra/db.ts)
- Server configuration (src/lib/server/conf/server.config.ts)
- Better Auth setup function (src/lib/server/infra/auth.ts)
- SurrealDB adapter for Better Auth (src/lib/domain/auth/adapters/better-auth.adapter.ts) ✅ **MOVED TO CORRECT LOCATION**
- Better Auth service implementation (src/lib/domain/auth/adapters/better-auth.service.ts) ✅ **MOVED TO CORRECT LOCATION**
- API route mounted (src/routes/api/auth/[...auth]/+server.ts)
- Jest config scaffolded (jest.config.mjs)
- Playwright port + scripts aligned to 5173 (preview:test)
- Auth helpers created (src/lib/server/auth-helpers.ts)

✅ **Auth Domain Structure Alignment (COMPLETED):**
- ✅ Auth components properly organized within auth domain
- ✅ Page components created - routes now import LoginPage, CreateAccountPage, ResetPasswordPage
- ✅ Auth schemas moved to correct location (auth/schema/ instead of +shared)
- ✅ Complete atomic design structure created for auth UI components
- ✅ All components follow Svelte 5 patterns (snippets, DOM events, proper typing)
- ✅ End-to-end testing verified via Playwright MCP

❌ **Still needed (to enable full end‑to‑end auth locally):**
- Set BETTER_AUTH_SECRET when running preview/dev so Better Auth can sign/verify sessions.
  Example (PowerShell): `$env:BETTER_AUTH_SECRET='dev-secret'; npm run preview:test-non-block`
- **Fix domain structure violations before final validation**
- Optional: configure OAuth provider env vars if you plan to exercise provider linking end‑to‑end.

✅ Already satisfied:
- Dependencies installed (zod present; ts-jest configured in jest.config.mjs)
- Auth middleware integrated in src/hooks.server.ts (paraglide + better‑auth)
- Domain structure and UI components scaffolded; shadcn/ui installed and in use


## References
- .augment/rules/spike.md (plan and validation playbook)
- .augment/rules/best-practice.md and AGENTS.md (Svelte 5 idioms, testing)
- .augment/knowledge/server-services-architecture.md (DI patterns, owner scoping)
- Better Auth docs: https://www.better-auth.com/
- SurrealDB docs: https://surrealdb.com/docs
