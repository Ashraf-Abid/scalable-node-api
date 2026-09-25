import type { Prisma, User } from '@prisma/client';
import { ConflictError, NotFoundError } from '../errors/app-error';
import { userRepository } from '../repositories/user.repository';
import type { ListUsersQuery } from '../schemas/user.schema';
import type { PaginatedResult } from '../types/pagination';

/**
 * Business rules live here — the repository only knows how to talk to
 * Postgres, it has no opinion on whether an operation *should* happen.
 * "Reject a duplicate email" and "user must exist to update/delete it"
 * are both business rules, so they belong in this layer, not the
 * repository or a future controller.
 */

async function createUser(input: Prisma.UserCreateInput): Promise<User> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError(`A user with email "${input.email}" already exists.`, 'USER_EMAIL_TAKEN');
  }
  return userRepository.create(input);
}

async function getUserById(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" was not found.`, 'USER_NOT_FOUND');
  }
  return user;
}

async function listUsers(query: ListUsersQuery): Promise<PaginatedResult<User>> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const { users, total } = await userRepository.findManyPaginated({ skip, take: limit });
  return {
    items: users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async function updateUser(id: string, input: Prisma.UserUpdateInput): Promise<User> {
  await getUserById(id);

  if (typeof input.email === 'string') {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new ConflictError(`A user with email "${input.email}" already exists.`, 'USER_EMAIL_TAKEN');
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
