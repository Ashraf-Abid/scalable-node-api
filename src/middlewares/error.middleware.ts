import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app-error';

/**
 * The single place that turns a thrown/rejected error into an HTTP
 * response. Express recognizes this as error-handling middleware purely
 * by its four-parameter signature — Express 5 automatically forwards a
 * rejected promise from an async route handler here, so controllers won't
 * need a manual try/catch + next(err) around every handler.
 *
 * The response envelope ({ success: false, error: { code, message } })
 * matches Step 20's standardized shape, so this won't need reshaping once
 * the success-response side is added.
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
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: z.flattenError(err).fieldErrors,
      },
    });
    return;
  }

  // Anything else is an unhandled bug, not an expected failure — log the
  // real error server-side but never leak internals (message, stack) to
  // the client.
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  });
}
