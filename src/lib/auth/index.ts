import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true, // Use plural table names (users, sessions, etc.)
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Add your social providers here when ready
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID || '',
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    // },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session updated every day)
  },
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
