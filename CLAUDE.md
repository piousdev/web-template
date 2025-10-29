---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# CLAUDE CODE Research Protocol (FOLLOW STRICTLY)

## Before ANY implementation:

### 1. Verify Current Setup (DO THIS FIRST)
- [ ] Check package.json for versions
- [ ] Check package manager (bun.lockb = bun, not npm/npx)
- [ ] Check existing implementation of similar features
- [ ] Check environment variables in .env.example

### 2. Research Official Docs
For ANY library/framework you're about to use:
- [ ] Find official docs URL
- [ ] Verify API for OUR version (not latest, not outdated)
- [ ] Check migration guides if we're on older version
- [ ] Note any breaking changes

### 3. Analyze Existing Patterns
- [ ] Search codebase for similar implementations
- [ ] Identify our conventions (naming, structure, error handling)
- [ ] Flag any outdated/incorrect patterns found
- [ ] Propose fixes BEFORE adding new code

### 4. Ask Clarifying Questions
**ALWAYS ask when uncertain about:**
- Package manager (bun vs npm vs yarn)
- Currency (EUR vs USD)
- Timezone/locale defaults
- API endpoints structure
- Authentication flow
- Deployment target (Fly.io specifics)
- Feature scope ("add auth" - social? email? both?)

### 5. Propose, Don't Implement
Format: "I found X in docs, saw Y pattern in codebase, suggest Z approach. Proceed?"

## RED FLAGS (Stop and Ask):
- ❌ Using `npx` (we use bun)
- ❌ Adding $ for currency (confirm EUR/USD first)
- ❌ Assuming API exists (check routes first)
- ❌ Using deprecated patterns (verify against latest docs)
- ❌ Creating new pattern (check if we have existing one)
- ❌ Deleting code (explain why it's safe to delete)
- ❌ Breaking changes (list what breaks, how to migrate)

## Response Template:
```
**Research Done:**
1. Checked package.json: [library@version]
2. Official docs: [URL] - confirmed [API/pattern]
3. Existing code: Found [pattern] in [file]
4. Issues found: [any outdated/wrong code]

**Questions:**
- [Any assumptions I need to confirm]

**Proposed approach:**
- [What I'll do]
- [Why this way]
- [What might break]

Proceed?
```

---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

---

## Boilerplate Completion Checklist

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Next.js installation with create-next-app
- [x] All dependencies installed (core, database, auth, state, services, testing)
- [x] Configuration files (biome.json, drizzle.config.ts, vitest.config.ts, playwright.config.ts, fly.toml, next.config.ts)
- [x] Complete folder structure created
- [x] Database schema (users, sessions, accounts, verifications)
- [x] Better Auth configuration (src/lib/auth/index.ts)
- [x] Database connection (src/lib/db/index.ts)
- [x] Sentry configuration (sentry.server.config.ts, sentry.edge.config.ts)
- [x] .env.example with all services (updated with Polar)
- [x] Comprehensive README.md
- [x] Tailwind CSS v4 + PostCSS setup (postcss.config.mjs, globals.css)
- [x] shadcn/ui initialized with all components (src/components/shadcn/)

### ✅ Phase 2: Core Libraries (COMPLETED)
- [x] src/lib/redis.ts (Upstash client with cache helpers, rate limiting)
- [x] src/lib/queue.ts (Bull queue setup for email/notifications - production optimized)
- [x] src/lib/api-client.ts (Client-side axios with retry logic, 10s timeout)
- [x] src/lib/server-api.ts (Server-side axios with retry logic)
- [x] src/lib/socket.ts (Socket.io client wrapper with WebSocket optimization)
- [x] src/lib/utils/constants.ts
- [x] src/lib/utils/validators.ts (Zod schemas)
- [x] next-intl setup (src/i18n/routing.ts, src/i18n/request.ts, src/proxy.ts)
- [x] Translation merge scripts (scripts/translations/merge.ts, watch.ts)
- [x] Component-based i18n with automated merge system

### ✅ Phase 3: Services (COMPLETED)
- [x] src/services/email.service.ts + test (Resend integration)
- [x] src/services/payment.service.ts + test (Polar integration - NOT Stripe)
- [x] src/services/storage.service.ts + test (Cloudflare R2 integration)
- [x] src/services/auth.service.ts + test
- [x] src/services/user.service.ts + test
- [x] src/services/index.ts (barrel export)

### ✅ Phase 4: Example Components (COMPLETED)
- [x] src/components/button/* (index.tsx, types, test, locale/en.json, uses shadcn)
- [x] src/components/card/* (index.tsx, types, test, locale/en.json, uses shadcn)
- [x] src/components/layout/header/* (index.tsx, types, test, locale/en.json, Tailwind classes)
- [x] src/components/layout/sidebar/* (index.tsx, types, test, locale/en.json, Tailwind classes)
- [x] src/components/common/loading/* (index.tsx, types, test, locale/en.json, Tailwind classes)
- [x] src/components/common/error/* (index.tsx, types, test, locale/en.json, Tailwind classes)
- [x] src/components/home/home.tsx (uses shadcn/Tailwind, locale/en.json)
- [x] src/app/error.tsx (error boundary page)
- [x] src/app/not-found.tsx (404 page)
- [x] src/app/global-error.tsx (updated with ErrorDisplay)
- [x] src/app/loading.tsx (app-wide loading page)

### ✅ Phase 5: App Routes and Pages (COMPLETED)
- [x] src/app/page.tsx (home page using HomePage component)
- [x] src/app/layout.tsx (updated with next-intl, ThemeProvider)
- [x] src/app/(auth)/login/page.tsx (with social auth, i18n)
- [x] src/app/(auth)/register/page.tsx (with terms acceptance, i18n)
- [x] src/app/dashboard/page.tsx (stats, recent activity, quick actions)
- [x] src/app/api/auth/[...auth]/route.ts (Better Auth API route)
- [x] src/app/api/webhooks/polar/route.ts (Polar webhook handler with signature verification)
- [x] src/app/api/health/route.ts (health check with database status)
- [x] messages/en.json (auth and dashboard translations)

### ✅ Phase 6: Hooks and Store (COMPLETED)
- [x] src/hooks/use-auth.ts + test (Better Auth integration with sign in/up/out)
- [x] src/hooks/use-locale.ts + test (i18n management with next-intl)
- [x] src/hooks/use-socket.ts + test (Socket.io client wrapper)
- [x] src/hooks/index.ts (barrel export)
- [x] src/store/auth.store.ts + test (Zustand with localStorage persistence)
- [x] src/store/app.store.ts + test (Zustand for theme, notifications, sidebar)
- [x] src/store/index.ts (barrel export with selectors)

### ✅ Phase 7: Server Actions and Middleware (COMPLETED)
- [x] src/server-actions/auth.actions.ts + test (sign in/up/out, password reset, email verify)
- [x] src/server-actions/user.actions.ts + test (CRUD operations with auth checks)
- [x] src/server-actions/index.ts (barrel export)
- [x] src/proxy.ts (authentication proxy with route protection)

### ✅ Phase 8: Test Setup and Examples (COMPLETED)
- [x] tests/setup.ts (Vitest global setup with test utilities)
- [x] tests/unit/utils/validators.test.ts (Zod schema validation tests)
- [x] tests/unit/services/auth.service.test.ts (Auth service unit tests)
- [x] tests/e2e/auth.setup.ts (Playwright storageState authentication setup)
- [x] tests/e2e/auth.spec.ts (Playwright auth flow E2E tests)
- [x] tests/e2e/dashboard.spec.ts (Playwright dashboard E2E tests)
- [x] tests/load/api.load.js (k6 load testing for API routes)
- [x] tests/load/config.js (k6 configuration with test stages)
- [x] playwright.config.ts (Updated with setup project pattern)

### ✅ Phase 9: Docker and CI/CD (COMPLETED)
- [x] docker/Dockerfile (Multi-stage build with Bun runtime, optimized to ~310MB)
- [x] docker/.dockerignore (Comprehensive exclusion list)
- [x] docker-compose.yml (PostgreSQL, Redis, and Next.js app with health checks)
- [x] .github/workflows/ci.yml (Lint, type-check, unit tests, E2E tests, build)
- [x] .github/workflows/deploy.yml (Automated Fly.io deployment with health checks)
- [x] .github/workflows/load-test.yml (k6 load tests with multiple stages)
- [x] next.config.ts (Updated with standalone output for Docker)

### ✅ Phase 10: Types and Styles (COMPLETED)
- [x] src/types/common.types.ts (Shared utility types with strict readonly, no `any` usage)
- [x] src/types/auth.types.ts (Authentication and session types)
- [x] src/types/user.types.ts (User profiles, preferences, management)
- [x] src/types/payment.types.ts (Polar payment types with immutability)
- [x] src/types/api.types.ts (API requests, responses, HTTP interactions)
- [x] src/types/index.ts (Barrel export for all types)
- [x] src/env.ts (Type-safe environment validation with @t3-oss/env-nextjs)

### ✅ Phase 11: Documentation (COMPLETED)
- [x] docs/PROJECT-CONTEXT.md (Source of truth: stack, business context, architecture principles)
- [x] docs/QUICK-START.md (Onboarding guide with setup instructions)
- [x] docs/DEPENDENCIES.md (Comprehensive dependency list with removal guides)

### 🔧 Phase 12: Git Repository
- [ ] Verify/update .gitignore
- [ ] git init
- [ ] Initial commit with all boilerplate code

---

## Current Status
**Progress**: ~98% Complete (Phase 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, & 11 done)
**Next**: Phase 12 (Git Repository) - Initialize repository and create initial commit

## Key Technology Changes
- ✅ **Tailwind CSS v4** installed (not v3) - uses CSS-first configuration
- ✅ **shadcn/ui** fully installed with all components in src/components/shadcn/
- ✅ **Polar** payment provider (replaced Stripe) - Merchant of Record with global tax compliance
- ✅ **next-intl** system retained for production-ready i18n with component-based locale files
