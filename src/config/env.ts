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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
