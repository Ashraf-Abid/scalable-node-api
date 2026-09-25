import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../schemas/user.schema';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/api-response';

/**
 * Parses the request, calls the service, shapes the response — nothing
 * else. Validation errors (ZodError, from .parse()) and business-rule
 * errors (AppError subclasses, from the service) both just propagate as
 * rejected promises; Express 5 forwards those straight to the global
 * error middleware (Step 19), so no handler here needs its own try/catch.
 *
 * Not wired to any route yet — that's Step 22.
 */

// Never send the password hash back to a client, in any response shape.
function toPublicUser(user: User) {
  const { password, ...publicUser } = user;
  return publicUser;
}

async function createUser(req: Request, res: Response): Promise<void> {
  const input = createUserSchema.parse(req.body);
  const user = await userService.createUser(input);
  sendSuccess(res, toPublicUser(user), 201);
}

async function getUser(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  const user = await userService.getUserById(id);
  sendSuccess(res, toPublicUser(user));
}

async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await userService.listUsers();
  sendSuccess(res, users.map(toPublicUser));
}

async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  const input = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(id, input);
  sendSuccess(res, toPublicUser(user));
}

async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  const user = await userService.deleteUser(id);
  sendSuccess(res, toPublicUser(user));
}

export const userController = {
  createUser,
  getUser,
  listUsers,
  updateUser,
  deleteUser,
};
