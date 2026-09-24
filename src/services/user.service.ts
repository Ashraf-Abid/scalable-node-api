import type { Prisma, User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';

/**
 * Business rules live here — the repository only knows how to talk to
 * Postgres, it has no opinion on whether an operation *should* happen.
 * "Reject a duplicate email" and "user must exist to update/delete it"
 * are both business rules, so they belong in this layer, not the
 * repository or a future controller.
 *
 * Errors thrown here are plain `Error`s for now because typed errors
 * (NotFoundError, ConflictError) don't exist yet — that's Step 18. Once
 * they do, only the `throw` lines change; the rules themselves already
 * live in the right place.
 */

async function createUser(input: Prisma.UserCreateInput): Promise<User> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new Error(`A user with email "${input.email}" already exists.`);
  }
  return userRepository.create(input);
}

async function getUserById(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error(`User with id "${id}" was not found.`);
  }
  return user;
}

async function listUsers(): Promise<User[]> {
  return userRepository.findMany();
}

async function updateUser(id: string, input: Prisma.UserUpdateInput): Promise<User> {
  await getUserById(id);

  if (typeof input.email === 'string') {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new Error(`A user with email "${input.email}" already exists.`);
    }
  }

  return userRepository.update(id, input);
}

async function deleteUser(id: string): Promise<User> {
  await getUserById(id);
  return userRepository.delete(id);
}

export const userService = {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
};
