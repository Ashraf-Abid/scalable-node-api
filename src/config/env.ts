import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Populate process.env from .env in local/dev environments. In real
// deployments (Docker, CI, cloud) env vars are injected by the platform and
// no .env file exists — dotenv silently no-ops in that case.
// `quiet: true` suppresses dotenv's informational console banner.
loadDotenv({ quiet: true });

/**
 * Schema for every environment variable the application depends on.
 *
 * Validating this once at startup means a misconfigured deployment fails
 * immediately with a clear message, instead of surfacing as a confusing
 * runtime error later (e.g. `PORT` being the string "abc" and crashing deep
 * inside http.Server). This is the Node equivalent of Spring Boot failing
 * fast on an invalid application.yml / @ConfigurationProperties binding.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  // min(32) rejects a trivially weak/short secret at startup — a JWT
  // signed with a short secret is brute-forceable offline, with no way
  // to detect the compromise from the API side.
  //
  // The second check (Step 41 security review) closes a real gap: the
  // instructional placeholder committed in .env.example is 66 characters
  // — long enough to pass min(32). Anyone who copies that file to .env
  // without replacing it would start the app with a secret that's public
  // on GitHub, letting anyone forge a valid token for any user. Rejecting
  // the literal placeholder value forces it to actually be changed.
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .refine(
      (value) => value !== 'replace-with-a-generated-random-secret-at-least-32-characters-long',
      'JWT_SECRET is still the placeholder value from .env.example — generate a real secret',
    ),
  JWT_EXPIRES_IN: z.string().default('1d'),
  // Comma-separated list of origins allowed to call this API from a
  // browser. No default: an unset CORS_ORIGIN should break cross-origin
  // frontend access loudly (a visible, easy-to-notice failure), not
  // silently fall back to something permissive like "*" that would only
  // get noticed as a security gap, not a functional one.
  CORS_ORIGIN: z
    .string()
    .min(1, 'CORS_ORIGIN is required')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
