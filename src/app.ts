import express, { type Express } from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
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

// Parse JSON request bodies so route handlers can read `req.body`.
app.use(express.json());

// Liveness check: confirms the process is up and able to handle HTTP
// requests. Deliberately has no dependencies (no DB, no auth) so it stays
// reliable for load balancers / container orchestrators to poll.
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' });
});

app.use('/api/v1/users', userRoutes);

// Must come after every route: turns any unmatched path into a
// consistent NotFoundError instead of Express's default HTML 404 page.
app.use(notFoundMiddleware);

// Must be registered last: Express identifies error-handling middleware
// by its four-parameter signature, and only calls it for errors passed to
// next(err) — including the ones notFoundMiddleware above produces.
app.use(errorMiddleware);

export default app;
