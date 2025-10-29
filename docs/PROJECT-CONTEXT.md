# Project Context (Source of Truth)

## Stack Details
- **Package Manager:** bun (NOT npm/npx/yarn)
- **Node Version:** Check `package.json` engines field or run `node --version`
- **TypeScript:** Strict mode enabled
- **Deployment:** Fly.io
- **Primary Region:** [Ask user - project based]

## Business Context
- **User Base:** Define based on project (e.g., 1M+ across Africa, Europe, Americas, Asia)
- **Currency:** [EUR/USD/multi?] - **Project based, ask user before implementing payments**
- **Timezone:** [default TZ] - **Project based, ask user**
- **Languages:** [English only or i18n?] - **Project based, ask user** (template has i18n ready, can be removed if not needed)
- **Scale Considerations:** Cost-effective, managed services preferred

## Non-Negotiables
- ✅ Managed services over self-hosted
- ✅ Open-source where possible for portability
- ✅ Strict TypeScript everywhere (no `any`, readonly by default)
- ✅ No vendor lock-in where possible
- ✅ Low maintenance solutions
- ✅ Use Bun for all commands (NOT npm/npx)

## Decision Record
| Decision | Why | Date |
|----------|-----|------|
| BetterAuth over Clerk | API-driven, portable, open-source | 2025-2026 |
| Neon over RDS | Serverless PostgreSQL, cost-effective | 2025-2026 |
| Polar over Stripe | Merchant of Record, handles global tax/compliance | 2025-2026 |
| Cloudflare R2 over S3 | No egress fees, S3-compatible | 2025-2026 |
| Drizzle over Prisma | Type-safe, SQL-like, better performance | 2025-2026 |
| Vitest over Jest | Faster, native ESM, better DX | 2025-2026 |
| Playwright over Cypress | Better API, faster, multi-browser | 2025-2026 |
| k6 over JMeter | JS-based, modern, better for API load tests | 2025-2026 |
| Biome over ESLint+Prettier | Faster, single tool, better defaults | 2025-2026 |
| @t3-oss/env-nextjs | Type-safe env vars, industry standard | 2025-2026 |

## Template Philosophy

This is a **comprehensive starting template**, not a minimal boilerplate. It includes:
- Authentication (BetterAuth)
- Payments (Polar)
- Database (Neon PostgreSQL + Drizzle)
- Caching/Queue (Upstash Redis)
- Storage (Cloudflare R2)
- Email (Resend)
- Monitoring (Sentry)
- Testing (Unit, E2E, Load)
- CI/CD (GitHub Actions)
- Docker deployment

**You will NOT need all of these for every project.**

### Before Starting a New Project:
1. Clone this template
2. Review `docs/DEPENDENCIES.md` to understand what's included
3. Remove services you don't need (see removal guides in each section)
4. Configure remaining services for your project
5. Update `PROJECT-CONTEXT.md` with your project specifics

## Architecture Principles

### 1. Type Safety First
- All data structures have TypeScript types in `src/types/`
- Response types are readonly (immutable)
- Request types are mutable (user input)
- Environment variables validated with Zod
- No `any` usage anywhere

### 2. Server Components by Default
- Use React Server Components where possible
- Client components only when needed (interactivity, hooks)
- Server actions for mutations
- API routes for external integrations

### 3. Progressive Enhancement
- Forms work without JavaScript
- Loading states for all async operations
- Error boundaries at appropriate levels
- Optimistic updates where beneficial

### 4. Security First
- CSRF protection enabled
- Rate limiting configured
- Input validation with Zod
- Secure headers configured
- Environment variables never exposed to client
- API keys in server-side only

### 5. Performance
- Docker images optimized (~310MB)
- Database connection pooling
- Redis caching layer
- Static generation where possible
- Image optimization configured
- Bundle analysis ready

## Getting Started

See `docs/QUICK-START.md` for setup instructions.
