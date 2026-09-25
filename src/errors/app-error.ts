/**
 * Base class for expected, "operational" application errors — a missing
 * resource, bad input, a duplicate email — as opposed to unexpected bugs.
 * The global error middleware (Step 19) will use `instanceof` checks
 * against these subclasses to pick the right HTTP status and response
 * shape; anything that ISN'T one of these is treated as an unhandled bug
 * and hidden behind a generic message instead of leaking internals.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code: string;

  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message);
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code: string;

  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message);
    this.code = code;
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code: string;

  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code: string;

  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message);
    this.code = code;
  }
}
