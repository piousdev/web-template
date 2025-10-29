import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all Better Auth endpoints:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - And all other Better Auth endpoints
 *
 * Better Auth automatically generates these endpoints based on your configuration.
 */
export const { GET, POST } = toNextJsHandler(auth);
