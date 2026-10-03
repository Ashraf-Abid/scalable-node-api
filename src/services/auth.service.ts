import type { User } from '@prisma/client';
import { UnauthorizedError } from '../errors/app-error';
import type { LoginInput } from '../schemas/auth.schema';
import type { CreateUserInput } from '../schemas/user.schema';
import { signToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import { userService } from './user.service';

/**
 * Auth is its own bounded concern (registration, login, eventually
 * sessions/tokens) — its controller shouldn't reach into userService
 * directly, even though registration today is just "create a user."
 */
async function register(input: CreateUserInput): Promise<User> {
  return userService.createUser(input);
}

// Precomputed bcrypt hash of an arbitrary string, used only to keep
// comparePassword's timing consistent when no matching user exists.
// bcrypt.compare is deliberately slow; without this, a nonexistent email
// would respond measurably faster than a wrong password for a real
// account, letting an attacker enumerate registered emails by timing.
const DUMMY_PASSWORD_HASH = '$2b$12$P7./E7sI6eod/tbIWOhMBO5sg0r22s0bemuSRvqfOfgWaeXDT694y';

async function login(input: LoginInput): Promise<{ user: User; token: string }> {
  const user = await userService.findByEmail(input.email);
  const passwordMatches = await comparePassword(input.password, user?.password ?? DUMMY_PASSWORD_HASH);

  // Same error, same message, same status, whether the email doesn't
  // exist or the password is wrong — distinguishing the two would let an
  // attacker enumerate which emails are registered.
  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signToken(user.id);
  return { user, token };
}

export const authService = {
  register,
  login,
};
