import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/app-error';

/**
 * Express only invokes error-handling middleware for errors passed to
 * next(err) — it has no built-in concept of "no route matched". Mounted
 * after every real route, this turns an unmatched path into the same
 * NotFoundError our own code throws elsewhere, so a bad URL gets a
 * consistent JSON response instead of Express's default HTML 404 page.
 */
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
}
