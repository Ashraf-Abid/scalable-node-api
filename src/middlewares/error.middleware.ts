import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { sendError } from '../utils/api-response';

/**
 * The single place that turns a thrown/rejected error into an HTTP
 * response. Express recognizes this as error-handling middleware purely
 * by its four-parameter signature — Express 5 automatically forwards a
 * rejected promise from an async route handler here, so controllers won't
 * need a manual try/catch + next(err) around every handler.
 *
 * Every branch below goes through sendError (Step 20) instead of building
 * the { success: false, error: {...} } object literal itself, so the
 * error envelope can never drift out of sync with the success envelope.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // Express requires exactly 4 parameters to treat this as error-handling
  // middleware, even though it's never actually called.
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', z.flattenError(err).fieldErrors);
    return;
  }

  // Anything else is an unhandled bug, not an expected failure — log the
  // real error server-side but never leak internals (message, stack) to
  // the client.
  console.error('Unexpected error:', err);
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Something went wrong');
}
