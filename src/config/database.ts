import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * A single shared PrismaClient instance for the whole app.
 *
 * PrismaClient manages its own connection pool internally — instantiating
 * a new one per repository (e.g. `new PrismaClient()` inside each file)
 * would open a separate pool per instance and exhaust Postgres's
 * connection limit under load. Every repository imports this same
 * instance instead, the Node equivalent of a single shared
 * DataSource/EntityManager bean in Spring rather than one per repository.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
