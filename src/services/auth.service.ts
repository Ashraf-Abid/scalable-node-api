import type { User } from '@prisma/client';
import type { CreateUserInput } from '../schemas/user.schema';
import { userService } from './user.service';

/**
 * Auth is its own bounded concern (registration, login, eventually
 * sessions/tokens) — its controller shouldn't reach into userService
 * directly, even though registration today is just "create a user."
 * Step 34 (login) adds real logic here (password comparison); this isn't
 * a pointless pass-through, it's the same layer login will share.
 */
async function register(input: CreateUserInput): Promise<User> {
  return userService.createUser(input);
}

export const authService = {
  register,
};
