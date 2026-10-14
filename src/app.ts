import express, { type Express } from 'express';
import helmet from 'helmet';
import { authenticate } from './middlewares/authenticate.middleware';
import { requireRole } from './middlewares/authorize.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { sendSuccess } from './utils/api-response';

/**
 * Builds and configures the Express application.
 *
 * Deliberately separated from server.ts: this file only describes *what*
 * the app is (middleware, routes) and never binds to a port or touches the
 * process. That makes it possible to import `app` directly in tests later
 * (via supertest) without a real server listening on a real socket.
 */
const app: Express = express();

// Sets a standard set of defensive HTTP response headers (X-Content-
// Type-Options, X-Frame-Options, a restrictive Content-Security-Policy,
// etc.) on every response. Mounted first, before anything else — it's
// pure header-setting with no dependency on parsed input, and should
// apply even to responses from middleware that runs later (including
// error responses). Most of this matters more once something here
// serves actual HTML (Swagger UI, Step 51) than for raw JSON, but it's
// free defense-in-depth either way and standard practice regardless.
app.use(helmet());

// Parse JSON request bodies so route handlers can read `req.body`.
app.use(express.json());

// Liveness check: confirms the process is up and able to handle HTTP
// requests. Deliberately has no dependencies (no DB, no auth) so it stays
// reliable for load balancers / container orchestrators to poll.
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
// /api/v1/users is an admin-only management interface — listing,
// creating, or editing arbitrary accounts is not something a regular
// USER should be able to do. Self-service (register/login) stays under
// /api/v1/auth, unaffected by this restriction.
app.use('/api/v1/users', authenticate, requireRole('ADMIN'), userRoutes);

// Must come after every route: turns any unmatched path into a
// consistent NotFoundError instead of Express's default HTML 404 page.
app.use(notFoundMiddleware);

// Must be registered last: Express identifies error-handling middleware
// by its four-parameter signature, and only calls it for errors passed to
// next(err) — including the ones notFoundMiddleware above produces.
app.use(errorMiddleware);

export default app;
