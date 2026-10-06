import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { NotFoundError, UnauthorizedError } from '../errors/app-error';
import { userService } from '../services/user.service';
import { toPublicUser } from '../utils/public-user';

/**
 * Verifies the Bearer token on an incoming request and attaches the
 * authenticated user to req.user. Not applied to any route yet — that's
 * Step 36.
 *
 * Re-fetches the user from the database on every request rather than
 * trusting the token's claims alone — a deleted user's token would still
 * pass signature/expiry verification right up until it expires, so this
 * is what actually rejects it immediately. The cost is one extra query
 * per authenticated request, a standard, worthwhile trade-off for
 * correctness over raw throughput.
 *
 * jwt.verify's own error types (JsonWebTokenError, TokenExpiredError)
 * aren't AppError subclasses, so the global error middleware (Step 19)
 * would otherwise treat them as unexpected bugs and respond 500 — they're
 * caught here and translated into a proper 401.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header', 'MISSING_TOKEN');
  }

  const token = authHeader.slice('Bearer '.length);

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
  }

  if (typeof payload.sub !== 'string') {
    throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
  }

  try {
    const user = await userService.getUserById(payload.sub);
    req.user = toPublicUser(user);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new UnauthorizedError('User no longer exists', 'INVALID_TOKEN');
    }
    throw err;
  }

  next();
}
