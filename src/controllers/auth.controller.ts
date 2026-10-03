import type { Request, Response } from 'express';
import { loginSchema } from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/user.schema';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';
import { toPublicUser } from '../utils/public-user';

/**
 * Registration's request shape is identical to creating a user (name,
 * email, password), so it reuses createUserSchema rather than duplicating
 * an identical schema under a different name.
 */
async function register(req: Request, res: Response): Promise<void> {
  const input = createUserSchema.parse(req.body);
  const user = await authService.register(input);
  sendSuccess(res, toPublicUser(user), 201);
}

async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const { user, token } = await authService.login(input);
  sendSuccess(res, { user: toPublicUser(user), token });
}

export const authController = {
  register,
  login,
};
