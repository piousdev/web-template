# Dependencies Guide

This template includes many services and libraries. **You probably don't need all of them.** This guide helps you understand what's included and how to remove what you don't need.

## Core Stack (Required)

### Next.js 16.0.1
- **What:** React framework with App Router
- **Why:** Server components, file-based routing, API routes
- **Docs:** https://nextjs.org/docs
- **Can Remove?** ❌ No - This is the foundation

### React 19.2.0
- **What:** UI library
- **Why:** Modern React with Server Components
- **Docs:** https://react.dev
- **Can Remove?** ❌ No - Required by Next.js

### TypeScript 5.x
- **What:** Type-safe JavaScript
- **Why:** Strict typing, better DX, fewer bugs
- **Docs:** https://www.typescriptlang.org/docs
- **Can Remove?** ❌ No - Entire codebase is TypeScript

### Tailwind CSS 4.1.16
- **What:** Utility-first CSS framework
- **Why:** Fast styling, responsive, customizable
- **Docs:** https://tailwindcss.com/docs
- **Can Remove?** ⚠️ Possible but not recommended
- **How to Remove:**
  - Remove `@tailwindcss/postcss` from devDependencies
  - Remove `postcss.config.mjs`
  - Remove Tailwind classes from all components
  - Replace with your CSS solution

## Authentication

### BetterAuth 1.3.34
- **What:** Open-source authentication library
- **Why:** API-driven, portable, not vendor-locked
- **Docs:** https://www.better-auth.com/docs
- **Features:**
  - Email/password authentication
  - Social OAuth (Google, GitHub, etc.) - configured but optional
  - Session management
  - Password reset
  - Email verification
- **Can Remove?** ✅ Yes, if you don't need authentication
- **How to Remove:**
  1. Remove `better-auth` from dependencies
  2. Delete `src/lib/auth/`
  3. Delete `src/services/auth.service.ts`
  4. Delete `src/server-actions/auth.actions.ts`
  5. Delete `src/hooks/use-auth.ts`
  6. Delete `src/store/auth.store.ts`
  7. Delete `src/app/(auth)/` directory
  8. Delete `src/app/api/auth/` directory
  9. Remove auth-related types from `src/types/auth.types.ts`
  10. Remove `BETTER_AUTH_*` from `.env` and `src/env.ts`

## Database

### Neon PostgreSQL (@neondatabase/serverless 1.0.2)
- **What:** Serverless PostgreSQL database
- **Why:** Auto-scaling, cost-effective, generous free tier
- **Docs:** https://neon.tech/docs
- **Can Remove?** ⚠️ Not easily - database is core to most apps
- **Alternatives:**
  - Supabase PostgreSQL
  - AWS RDS
  - Self-hosted PostgreSQL
- **If Switching:**
  - Change `DATABASE_URL` format
  - May need different driver package
  - Drizzle ORM works with any PostgreSQL

### Drizzle ORM 0.44.7 + drizzle-kit 0.31.6
- **What:** TypeScript ORM
- **Why:** Type-safe queries, SQL-like, better performance than Prisma
- **Docs:** https://orm.drizzle.team/docs
- **Can Remove?** ⚠️ Possible but requires full rewrite
- **Alternative:** Prisma, Kysely, raw SQL
- **How to Remove:**
  1. Remove `drizzle-orm` and `drizzle-kit`
  2. Delete `src/lib/db/`
  3. Delete `drizzle.config.ts`
  4. Rewrite all database queries

## Caching & Queues

### Redis (ioredis 5.8.2)
- **What:** In-memory data store
- **Why:** Caching, sessions, rate limiting, queues
- **Docs:** https://redis.io/docs
- **Used For:**
  - Session storage
  - Response caching
  - Rate limiting
  - Background job queues (with Bull)
- **Can Remove?** ✅ Yes, if no caching/queues needed
- **How to Remove:**
  1. Remove `ioredis` from dependencies
  2. Delete `src/lib/redis.ts`
  3. Delete `src/lib/queue.ts` (if removing Bull too)
  4. Remove Redis caching from services
  5. Remove `REDIS_*` from `.env` and `src/env.ts`

### Bull 4.16.5
- **What:** Background job queue
- **Why:** Email sending, async tasks, scheduled jobs
- **Docs:** https://github.com/OptimalBits/bull
- **Requires:** Redis
- **Can Remove?** ✅ Yes, if no background jobs needed
- **How to Remove:**
  1. Remove `bull` from dependencies
  2. Delete `src/lib/queue.ts`
  3. Remove queue-related code from services
  4. Move queue jobs to direct execution

## Payments

### Polar (@polar-sh/sdk 0.40.2)
- **What:** Merchant of Record payment provider
- **Why:** Handles global tax/compliance, subscriptions
- **Docs:** https://docs.polar.sh
- **Features:**
  - One-time payments
  - Subscriptions
  - Global tax handling
  - Automatic invoicing
  - Customer portal
- **Can Remove?** ✅ Yes, if no payments needed
- **How to Remove:**
  1. Remove `@polar-sh/sdk` from dependencies
  2. Delete `src/services/payment.service.ts`
  3. Delete `src/app/api/webhooks/polar/`
  4. Remove payment types from `src/types/payment.types.ts`
  5. Remove `POLAR_*` from `.env` and `src/env.ts`
  6. Remove payment-related UI components

## Storage

### Cloudflare R2 (@aws-sdk/client-s3 3.919.0)
- **What:** S3-compatible object storage
- **Why:** No egress fees, cost-effective, S3-compatible
- **Docs:** https://developers.cloudflare.com/r2/
- **Can Remove?** ✅ Yes, if no file uploads needed
- **Alternatives:** AWS S3, Supabase Storage, Vercel Blob
- **How to Remove:**
  1. Remove `@aws-sdk/client-s3` from dependencies
  2. Delete `src/services/storage.service.ts`
  3. Remove storage-related routes/components
  4. Remove `CLOUDFLARE_*` from `.env` and `src/env.ts`

## Email

### Resend 6.3.0
- **What:** Email API for developers
- **Why:** Simple API, great DX, reliable
- **Docs:** https://resend.com/docs
- **Can Remove?** ✅ Yes, if no emails needed
- **Alternatives:** SendGrid, Postmark, AWS SES
- **How to Remove:**
  1. Remove `resend` from dependencies
  2. Delete `src/services/email.service.ts`
  3. Remove email sending from auth flows
  4. Remove `RESEND_API_KEY` from `.env` and `src/env.ts`

## State Management

### Zustand 5.0.8
- **What:** Lightweight state management
- **Why:** Simple API, no boilerplate, TypeScript-first
- **Docs:** https://zustand.docs.pmnd.rs
- **Can Remove?** ✅ Yes, use React Context instead
- **How to Remove:**
  1. Remove `zustand` from dependencies
  2. Delete `src/store/` directory
  3. Replace with React Context or other solution

## Data Fetching

### TanStack Query 5.90.5
- **What:** Async state management
- **Why:** Caching, refetching, optimistic updates
- **Docs:** https://tanstack.com/query/latest
- **Can Remove?** ✅ Yes, use plain fetch or SWR
- **Currently:** Setup ready, not heavily used yet
- **How to Remove:**
  1. Remove `@tanstack/react-query` from dependencies
  2. Replace query hooks with plain fetch/SWR

## UI Components

### shadcn/ui (Multiple @radix-ui packages)
- **What:** Copy-paste component library
- **Why:** Accessible, customizable, not a dependency
- **Docs:** https://ui.shadcn.com
- **Components Installed:** All components in `src/components/shadcn/`
- **Can Remove?** ⚠️ Partially - remove unused components
- **How to Remove Unused:**
  1. Check which components you're using
  2. Delete unused files from `src/components/shadcn/`
  3. Remove corresponding `@radix-ui/*` dependencies
  4. Run `bun install` to clean up

### Lucide React 0.548.0
- **What:** Icon library
- **Why:** Beautiful icons, tree-shakeable
- **Docs:** https://lucide.dev
- **Can Remove?** ✅ Yes, use different icons
- **How to Remove:**
  1. Remove `lucide-react` from dependencies
  2. Replace icon imports with alternative

## Forms

### React Hook Form 7.65.0 + @hookform/resolvers 5.2.2
- **What:** Form library
- **Why:** Performance, validation, great DX
- **Docs:** https://react-hook-form.com
- **Can Remove?** ✅ Yes, use plain forms
- **How to Remove:**
  1. Remove `react-hook-form` and `@hookform/resolvers`
  2. Rewrite forms with plain form handling

## Validation

### Zod 4.1.12
- **What:** TypeScript-first schema validation
- **Why:** Type inference, composable, runtime safety
- **Docs:** https://zod.dev
- **Used In:**
  - `src/lib/utils/validators.ts` - form validation
  - `src/env.ts` - environment validation
  - All server actions
- **Can Remove?** ❌ Not recommended - heavily integrated
- **Alternative:** Yup, Joi, class-validator

## Utilities

### date-fns 4.1.0
- **What:** Date utility library
- **Why:** Lightweight, tree-shakeable, no Moment.js
- **Docs:** https://date-fns.org
- **Can Remove?** ✅ Yes, use native Date or other library

### clsx 2.1.1 + tailwind-merge 3.3.1
- **What:** Classname utilities
- **Why:** Conditional classes, Tailwind conflict resolution
- **Can Remove?** ⚠️ Only if removing Tailwind

### class-variance-authority 0.7.1
- **What:** Component variants
- **Why:** Type-safe variants for UI components
- **Used In:** shadcn/ui components
- **Can Remove?** ⚠️ Only if removing shadcn/ui

## Monitoring

### Sentry (@sentry/nextjs ^10)
- **What:** Error tracking and monitoring
- **Why:** Catch bugs in production, performance monitoring
- **Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Can Remove?** ✅ Yes, if no error tracking needed
- **How to Remove:**
  1. Remove `@sentry/nextjs` from dependencies
  2. Delete `sentry.*.config.ts` files
  3. Remove Sentry imports from code
  4. Remove `SENTRY_*` from `.env` and `src/env.ts`

## Real-time (Optional)

### Socket.io (socket.io 4.8.1 + socket.io-client 4.8.1)
- **What:** Real-time bidirectional communication
- **Why:** Chat, notifications, live updates
- **Docs:** https://socket.io/docs
- **Can Remove?** ✅ Yes, if no real-time features
- **Currently:** Setup ready, not implemented yet
- **How to Remove:**
  1. Remove `socket.io` and `socket.io-client`
  2. Delete `src/lib/socket.ts`
  3. Delete `src/hooks/use-socket.ts`
  4. Remove `NEXT_PUBLIC_SOCKET_URL` from `.env`

## Testing

### Vitest 4.0.4 (Unit Tests)
- **What:** Fast unit test framework
- **Why:** Vite-powered, fast, great DX
- **Docs:** https://vitest.dev
- **Can Remove?** ⚠️ Not recommended - testing is important
- **How to Remove:**
  1. Remove `vitest`, `@vitest/ui`, `@vitejs/plugin-react`
  2. Delete `vitest.config.ts`
  3. Delete `tests/unit/` directory
  4. Delete `tests/setup.ts`

### Playwright 1.56.1 (E2E Tests)
- **What:** End-to-end testing framework
- **Why:** Multi-browser, fast, great API
- **Docs:** https://playwright.dev
- **Can Remove?** ⚠️ Not recommended - E2E tests catch integration issues
- **How to Remove:**
  1. Remove `@playwright/test` from devDependencies
  2. Delete `playwright.config.ts`
  3. Delete `tests/e2e/` directory
  4. Delete `playwright/` directory

### k6 (Load Tests)
- **What:** Load testing tool
- **Why:** Catch performance issues before production
- **Docs:** https://k6.io/docs
- **Installed:** Must install separately - https://k6.io/docs/get-started/installation/
- **Can Remove?** ✅ Yes, delete `tests/load/`

## Code Quality

### Biome 2.2.0
- **What:** Fast linter and formatter
- **Why:** Replaces ESLint + Prettier, much faster
- **Docs:** https://biomejs.dev
- **Can Remove?** ⚠️ Not recommended - code quality is important
- **Alternative:** ESLint + Prettier
- **How to Remove:**
  1. Remove `@biomejs/biome`
  2. Delete `biome.json`
  3. Set up ESLint + Prettier

## Internationalization (Optional)

### next-intl 4.4.0
- **What:** i18n for Next.js
- **Why:** Type-safe translations, App Router support
- **Docs:** https://next-intl-docs.vercel.app
- **Can Remove?** ✅ Yes, if English-only
- **How to Remove:**
  1. Remove `next-intl` from dependencies
  2. Delete `src/i18n/` directory
  3. Delete `messages/` directory
  4. Delete `scripts/translations/` directory
  5. Remove i18n middleware from `src/proxy.ts`
  6. Simplify app routing (remove `[locale]` segments)
  7. Remove translation scripts from `package.json`
  8. Remove `ENABLE_I18N` from `.env`

## Environment Validation

### @t3-oss/env-nextjs 0.13.8
- **What:** Type-safe environment variables
- **Why:** Catch missing/invalid env vars at build time
- **Docs:** https://env.t3.gg
- **Can Remove?** ❌ Not recommended - prevents runtime errors
- **File:** `src/env.ts`

## Deployment

### Docker
- **What:** Containerization
- **Why:** Consistent deployments, works anywhere
- **Files:** `docker/Dockerfile`, `docker-compose.yml`
- **Can Remove?** ✅ Yes, deploy directly to Vercel/Netlify instead
- **How to Remove:**
  - Delete `docker/` directory
  - Delete `docker-compose.yml`
  - Delete `.dockerignore`

### Fly.io
- **What:** Deployment platform
- **Why:** Great for Docker, global edge network
- **Docs:** https://fly.io/docs
- **File:** `fly.toml`
- **Can Remove?** ✅ Yes, deploy elsewhere
- **Alternatives:** Vercel, Railway, Render, AWS

## CI/CD

### GitHub Actions
- **Files:** `.github/workflows/*`
- **Workflows:**
  - `ci.yml` - Lint, test, build on every push
  - `deploy.yml` - Deploy to Fly.io on main push
  - `load-test.yml` - Run k6 tests after deployment
- **Can Remove?** ✅ Yes, use different CI/CD
- **How to Remove:**
  - Delete `.github/workflows/` directory
  - Set up alternative (GitLab CI, CircleCI, etc.)

## Quick Removal Checklist

### Minimal App (Auth + Database only):
```bash
# Keep:
- Next.js, React, TypeScript, Tailwind
- BetterAuth
- PostgreSQL (Neon) + Drizzle
- Zod validation
- @t3-oss/env-nextjs

# Remove:
✅ Polar (payments)
✅ Redis + Bull (caching/queues)
✅ Cloudflare R2 (storage)
✅ Resend (email) - but keep if using email auth
✅ Socket.io (real-time)
✅ Sentry (monitoring) - but recommended to keep
✅ next-intl (i18n) - if English only
```

### No Authentication:
```bash
# Remove:
✅ BetterAuth
✅ Auth pages and components
✅ Session middleware
✅ Protected routes
```

### Static Site (No Backend):
```bash
# Remove:
✅ Database (Neon + Drizzle)
✅ BetterAuth
✅ Redis
✅ All API routes
✅ Server actions

# Keep:
- Next.js static export
- React components
- Tailwind CSS
```

## Summary

**Total Dependencies:** ~85 packages
**Core (Required):** ~30 packages
**Optional:** ~55 packages

**Recommendation:** Start by removing what you definitely don't need, then add back services as your project grows.
