// ─────────────────────────────────────────────────────────────
// Better Auth.
//  • Email/password sessions (httpOnly cookie).
//  • role additionalField: input:false — signup can never
//    self-grant admin. Admins are created via seed/manual DB update.
// ─────────────────────────────────────────────────────────────
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { user, session, account, verification } from './db/schema';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, input: false, defaultValue: 'customer' },
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
  ].filter((v): v is string => Boolean(v)),
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
