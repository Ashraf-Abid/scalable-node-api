import express, { type Express } from 'express';

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

export default app;
