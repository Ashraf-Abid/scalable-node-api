import type { Response } from 'express';

/**
 * The one shape every response in this API takes, success or error — so a
 * client can always check `success` first and know exactly where to look
 * next (`data` or `error`). Controllers will use sendSuccess; the global
 * error middleware (Step 19) uses sendError, so a failure response is
 * never hand-built as a second, potentially-drifting object literal.
 */
export interface SuccessResponseBody<T> {
  success: true;
  data: T;
}

export interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const body: SuccessResponseBody<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  const body: ErrorResponseBody = {
    success: false,
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return res.status(statusCode).json(body);
}
