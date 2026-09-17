import app from './app';
import { env } from './config/env';

/**
 * Safety net for programming errors that slip past normal error handling.
 * Node does NOT exit on an uncaught exception or unhandled promise
 * rejection by default — without these handlers the process can keep
 * running with corrupted in-memory state and silently misbehave instead of
 * failing loudly. Logging and exiting lets the process manager (Docker,
 * Kubernetes, etc.) restart a clean instance.
 *
 * This is a crash safety net, not graceful shutdown — it has nothing to
 * close yet (no DB/Redis connections exist until later phases), so it just
 * logs and exits. Closing open resources on SIGTERM/SIGINT is Step 63,
 * once there are actually resources to close.
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

// app.listen() fails asynchronously (e.g. the port is already taken), so a
// try/catch around it wouldn't catch anything — the failure only surfaces
// as an 'error' event on the returned server.
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use.`);
  } else {
    console.error('Failed to start server:', error);
  }
  process.exit(1);
});
