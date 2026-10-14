import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/app-error';

/**
 * A middleware *factory*, not a middleware — called as requireRole('ADMIN')
 * to produce the actual middleware, since the allowed roles differ per
 * route. Must run after authenticate (Step 35), which is what populates
 * req.user in the first place; a missing req.user here means authenticate
 * wasn't applied to this route, not that the user lacks permission.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return function (req: Request, _res: Response, next: NextFunction): void {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action.', 'FORBIDDEN');
    }
    next();
  };
}
