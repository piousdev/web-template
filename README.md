# Next.js Production Boilerplate

A production-ready Next.js + TypeScript boilerplate designed for applications serving 1M+ users. Includes complete authentication, database, real-time features, payments, and deployment setup.

## Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Package Manager**: Bun
- **Styling**: CSS Modules

### Database & ORM
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit

### Authentication & Session
- **Auth**: Better Auth
- **Session Store**: Redis (Upstash)

### State Management
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand

### Real-time
- **WebSockets**: Socket.io

### External Services
- **Email**: Resend
- **Payments**: Stripe
- **Storage**: Cloudflare R2 (S3-compatible)
- **Error Tracking**: Sentry
- **Queue**: Bull + Redis

### Testing
- **Unit Tests**: Vitest + Testing Library
- **E2E Tests**: Playwright
- **Load Tests**: k6

### Code Quality
- **Linter/Formatter**: Biome
- **Type Checking**: TypeScript strict mode

### Deployment
- **Platform**: Fly.io (multi-region)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (v1.0+)
- Node.js 18+ (for some tooling compatibility)
- Git

### 1. Clone and Install

```bash
# If using this as a template, clone your repository
git clone <your-repo-url>
cd <your-project-name>

# Install dependencies
bun install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See the **Environment Variables** section below for setup instructions for each service.

### 3. Database Setup

Generate and apply database migrations:

```bash
# Generate migration files from schema
bun run db:generate

# Push schema to database (development)
bun run db:push

# Or run migrations (production)
bun run db:migrate
```

Optional: Open Drizzle Studio to view your database:

```bash
bun run db:studio
```

### 4. Development

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Database (Required)
```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require
NEON_API_KEY=xxx
```

**Setup**:
1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from your project dashboard

### Redis / Upstash (Required)
```env
REDIS_URL=redis://default:password@xxx.upstash.io:38xxx
REDIS_TOKEN=xxx
REDIS_HOST=xxx.upstash.io
REDIS_PORT=38xxx
```

**Setup**:
1. Sign up at [Upstash](https://upstash.com)
2. Create a Redis database
3. Copy credentials from dashboard

### Authentication (Required)
```env
BETTER_AUTH_SECRET=your-secret-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Setup**: Generate a random secret:
```bash
openssl rand -base64 32
```

### Email - Resend (Optional)
```env
RESEND_API_KEY=re_xxx
```

**Setup**:
1. Sign up at [Resend](https://resend.com)
2. Verify your domain
3. Get API key from dashboard

### Payments - Stripe (Optional)
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**Setup**:
1. Sign up at [Stripe](https://stripe.com)
2. Get API keys from dashboard
3. Setup webhooks and get webhook secret

### Storage - Cloudflare R2 (Optional)
```env
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_ACCESS_KEY_ID=xxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_BUCKET_NAME=xxx
CLOUDFLARE_CDN_URL=https://cdn.example.com
```

**Setup**:
1. Create R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Configure public access if needed

### Error Tracking - Sentry (Optional)
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Setup**:
1. Create project at [Sentry](https://sentry.io)
2. Copy DSN from project settings

## Available Scripts

### Development
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
```

### Code Quality
```bash
bun run lint         # Lint and auto-fix with Biome
bun run format       # Format code with Biome
bun run check        # Run all Biome checks
bun run type-check   # TypeScript type checking
```

### Testing
```bash
bun run test:unit    # Run unit tests (Vitest)
bun run test:e2e     # Run E2E tests (Playwright)
bun run test:load    # Run load tests (k6)
bun run test:all     # Run unit + E2E tests
```

### Database
```bash
bun run db:generate  # Generate migrations from schema
bun run db:push      # Push schema to database (dev)
bun run db:migrate   # Run migrations (prod)
bun run db:studio    # Open Drizzle Studio
```

## Project Structure

```
├── .github/workflows/      # CI/CD workflows
├── docker/                 # Docker configuration
├── docs/                   # Documentation (MDX)
├── lib/                    # Auth config (for CLI)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth routes (grouped)
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Protected routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── button/
│   │   │   ├── index.tsx           # Component
│   │   │   ├── button.types.ts     # Types
│   │   │   ├── button.test.tsx     # Unit tests
│   │   │   ├── styles.module.css   # Styles
│   │   │   └── locale/en.json      # i18n
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries
│   │   ├── auth/          # Better Auth config
│   │   ├── db/            # Database & schema
│   │   ├── i18n/          # Internationalization
│   │   └── utils/         # Utilities
│   ├── server-actions/    # Server Actions
│   ├── services/          # Business logic (server)
│   ├── store/             # Zustand stores (client)
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── tests/
│   ├── e2e/               # Playwright E2E tests
│   ├── load/              # k6 load tests
│   └── unit/              # Vitest unit tests
└── ...
```

## Coding Standards

### File Naming
**Strict kebab-case** for all files:
- ✅ `user-profile.tsx`
- ✅ `auth-service.ts`
- ❌ `UserProfile.tsx`
- ❌ `authService.ts`

### Component Structure
All components with text must include a `locale/` folder for internationalization.

### Server vs Client
- **Default**: Server Components (no 'use client')
- **'use client'**: Only when needed (interactivity, hooks, browser APIs)
- **Data fetching**: Server Components or Server Actions only
- **State management**: Zustand (client) / TanStack Query (server state)

## Deployment

### Fly.io Setup

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login:
```bash
fly auth login
```

3. Update `fly.toml` with your app name

4. Deploy:
```bash
fly deploy
```

5. Set environment variables:
```bash
fly secrets set DATABASE_URL=xxx
fly secrets set BETTER_AUTH_SECRET=xxx
# ... set all other secrets
```

### GitHub Actions

CI/CD is preconfigured:
- **ci.yml**: Runs on push/PR (lint, type-check, test)
- **deploy.yml**: Deploys to Fly.io on main branch

Set `FLY_API_TOKEN` in GitHub repository secrets.

## Performance for Scale

Built-in optimizations for 1M+ users:
- ✅ Neon serverless PostgreSQL with connection pooling
- ✅ Redis caching (Upstash)
- ✅ Multi-region deployment (Fly.io)
- ✅ CDN for static assets (Cloudflare R2)
- ✅ Image optimization (Next.js)
- ✅ React Compiler enabled
- ✅ Compression enabled

## License

MIT
