# Quick Start Guide

## Prerequisites

- **Bun** installed (NOT Node.js/npm) - [Install Bun](https://bun.sh)
- **Git** for version control
- **Docker** (optional, for local services or deployment testing)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-name>

# Install dependencies with Bun
bun install
```

### 2. Review Dependencies

**IMPORTANT:** This template includes many services. You likely don't need all of them.

📄 **Read `docs/DEPENDENCIES.md`** to understand what's included and how to remove what you don't need.

Common scenarios:
- **No payments?** → Remove Polar integration
- **No file uploads?** → Remove Cloudflare R2
- **No emails?** → Remove Resend
- **No real-time features?** → Remove Socket.io
- **No background jobs?** → Remove Bull/Redis queue

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` and configure ONLY the services you need:**

#### Required (Minimal Setup):
```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
BETTER_AUTH_SECRET=your-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

#### Optional Services:
Configure only if you're using these features:
- Redis/Upstash (caching, queues, sessions)
- Resend (email sending)
- Polar (payments)
- Cloudflare R2 (file storage)
- Sentry (error tracking)

See `.env.example` for full list with descriptions.

### 4. Setup Database

```bash
# Generate database schema
bun run db:generate

# Push schema to database
bun run db:push

# Optional: Open Drizzle Studio to view database
bun run db:studio
```

### 5. Configure Project Context

Update `docs/PROJECT-CONTEXT.md` with your project specifics:
- Primary region for deployment
- Currency (EUR/USD)
- Default timezone
- Target user base
- Languages (enable/disable i18n)

### 6. Run Development Server

```bash
# Start development server
bun run dev

# Or with i18n translation watching
bun run dev:watch
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Authentication pages
│   │   ├── api/          # API routes
│   │   └── dashboard/    # Protected pages
│   ├── components/       # React components
│   │   ├── shadcn/       # shadcn/ui components
│   │   ├── layout/       # Layout components
│   │   └── common/       # Shared components
│   ├── lib/              # Core libraries
│   │   ├── auth/         # BetterAuth setup
│   │   ├── db/           # Database connection
│   │   └── utils/        # Utility functions
│   ├── services/         # Business logic services
│   ├── hooks/            # React hooks
│   ├── store/            # Zustand stores
│   ├── server-actions/   # Next.js server actions
│   ├── types/            # TypeScript types
│   └── env.ts            # Environment validation
├── tests/
│   ├── unit/             # Vitest unit tests
│   ├── e2e/              # Playwright E2E tests
│   └── load/             # k6 load tests
├── docker/               # Docker configuration
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Documentation
```

## Development Workflow

### Available Commands

```bash
# Development
bun run dev              # Start dev server
bun run dev:watch        # Dev server + i18n watch

# Building
bun run build           # Production build
bun run start           # Start production server

# Code Quality
bun run lint            # Lint with Biome
bun run format          # Format with Biome
bun run check           # Lint + format
bun run type-check      # TypeScript check

# Testing
bun run test:unit       # Run unit tests (Vitest)
bun run test:e2e        # Run E2E tests (Playwright)
bun run test:load       # Run load tests (k6)
bun run test:all        # Run all tests

# Database
bun run db:generate     # Generate migrations
bun run db:migrate      # Run migrations
bun run db:push         # Push schema directly
bun run db:studio       # Open Drizzle Studio

# Translations (if i18n enabled)
bun run lang:merge      # Merge translation files
bun run lang:watch      # Watch translations
```

### Adding a New Feature

1. **Check existing patterns** in similar files
2. **Add types** in `src/types/` if needed
3. **Create service** in `src/services/` for business logic
4. **Add server action** in `src/server-actions/` for mutations
5. **Create component** in `src/components/`
6. **Write tests** in `tests/unit/` and `tests/e2e/`
7. **Update translations** if i18n is enabled

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
bun run test:unit

# Run in watch mode
bunx vitest

# Run with UI
bunx vitest --ui
```

Tests location: `tests/unit/**/*.test.ts`

### E2E Tests (Playwright)

```bash
# Run E2E tests
bun run test:e2e

# Run in UI mode
bunx playwright test --ui

# Run specific test file
bunx playwright test tests/e2e/auth.spec.ts
```

Tests location: `tests/e2e/**/*.spec.ts`

### Load Tests (k6)

```bash
# Run smoke test (1 user)
bun run test:load

# Run with specific stage
k6 run -e TEST_STAGE=load tests/load/api.load.js

# Available stages: smoke, load, stress, spike, soak
```

Tests location: `tests/load/**/*.js`

## Deployment

### Using Docker

```bash
# Build image
docker build -f docker/Dockerfile -t your-app .

# Run locally
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Deploy to Fly.io

```bash
# Login to Fly.io
fly auth login

# Create app (first time only)
fly launch

# Deploy
fly deploy --dockerfile docker/Dockerfile

# View logs
fly logs

# Open app
fly open
```

**Important:** Set environment variables as secrets:
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set BETTER_AUTH_SECRET="your-secret"
# ... set all required env vars
```

### CI/CD

GitHub Actions workflows are configured in `.github/workflows/`:
- **ci.yml**: Runs on every push/PR (lint, test, build)
- **deploy.yml**: Deploys to Fly.io on push to main
- **load-test.yml**: Runs load tests after deployment

**Setup:**
1. Add `FLY_API_TOKEN` to GitHub repository secrets
2. Push to main branch triggers deployment

## Common Issues

### "Module not found" errors
```bash
# Clear Bun cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Database connection errors
- Check `DATABASE_URL` in `.env`
- Ensure database is accessible from your IP
- For Neon, check connection string includes `?sslmode=require`

### Type errors
```bash
# Regenerate types
bun run type-check

# Check for TypeScript errors
bunx tsc --noEmit
```

### Environment variable not found
- Check `src/env.ts` for validation rules
- Ensure variable is in `.env` file
- Restart dev server after changing `.env`

## Next Steps

1. ✅ Review `docs/DEPENDENCIES.md` - Remove unused services
2. ✅ Update `docs/PROJECT-CONTEXT.md` - Add your project details
3. ✅ Configure environment variables for services you're using
4. ✅ Remove unnecessary code (see removal guides in DEPENDENCIES.md)
5. ✅ Start building your features!

## Getting Help

- Check `docs/DEPENDENCIES.md` for service-specific docs
- Review existing code for patterns
- Check official docs for libraries (links in DEPENDENCIES.md)
- Ensure you're following the AI Research Protocol in `CLAUDE.md`
