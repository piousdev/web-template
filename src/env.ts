/**
 * Environment Variable Validation
 * Type-safe environment variables using @t3-oss/env-nextjs and Zod
 *
 * This file validates environment variables at build time and runtime,
 * ensuring type safety and preventing runtime errors due to missing or invalid env vars.
 *
 * Usage:
 * import { env } from '@/env';
 * console.log(env.DATABASE_URL); // Type-safe and validated
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and are never sent to the client
   */
  server: {
    // Node Environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // Database (Neon PostgreSQL)
    DATABASE_URL: z.string().url().min(1),
    NEON_API_KEY: z.string().min(1).optional(),

    // Redis / Upstash
    REDIS_URL: z.string().url().min(1),
    REDIS_TOKEN: z.string().min(1).optional(),
    REDIS_HOST: z.string().min(1).optional(),
    REDIS_PORT: z.string().optional(),

    // Authentication (Better Auth)
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "Better Auth secret must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().url().min(1),
    ALLOWED_ORIGINS: z.string().optional(),

    // Email (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),

    // Payments (Polar)
    POLAR_API_KEY: z.string().min(1).optional(),
    POLAR_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Storage (Cloudflare R2)
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
    CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1).optional(),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    CLOUDFLARE_BUCKET_NAME: z.string().min(1).optional(),
    CLOUDFLARE_CDN_URL: z.string().url().optional(),

    // Error Tracking (Sentry)
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // Deployment (Fly.io)
    FLY_API_TOKEN: z.string().optional(),
    FLY_APP_NAME: z.string().optional(),

    // Internationalization
    ENABLE_I18N: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // App Configuration
    NEXT_PUBLIC_API_URL: z.string().url().optional(),

    // Real-time (Socket.io)
    NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),

    // Payments (Polar)
    NEXT_PUBLIC_POLAR_ORG_ID: z.string().optional(),
    NEXT_PUBLIC_POLAR_CHECKOUT_URL: z.string().url().optional(),

    // Error Tracking (Sentry)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * Manual destructuring is required for Next.js to include them in the bundle
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEON_API_KEY: process.env.NEON_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    POLAR_API_KEY: process.env.POLAR_API_KEY,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_BUCKET_NAME: process.env.CLOUDFLARE_BUCKET_NAME,
    CLOUDFLARE_CDN_URL: process.env.CLOUDFLARE_CDN_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    FLY_API_TOKEN: process.env.FLY_API_TOKEN,
    FLY_APP_NAME: process.env.FLY_APP_NAME,
    ENABLE_I18N: process.env.ENABLE_I18N,

    // Client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_POLAR_ORG_ID: process.env.NEXT_PUBLIC_POLAR_ORG_ID,
    NEXT_PUBLIC_POLAR_CHECKOUT_URL: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },

  /**
   * Skip validation in certain environments
   * Useful for Docker builds or CI/CD where env vars aren't available yet
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes validation errors more descriptive
   */
  emptyStringAsUndefined: true,
});
