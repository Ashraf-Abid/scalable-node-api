import type { Prisma, User } from '@prisma/client';
import { ConflictError, NotFoundError } from '../errors/app-error';
import { userRepository } from '../repositories/user.repository';
import type { ListUsersQuery } from '../schemas/user.schema';
import type { PaginatedResult } from '../types/pagination';
import { hashPassword } from '../utils/password';

// Search matches name OR email, case-insensitively, as a substring — not
// an exact match, so "ash" finds "Ashraful".
function buildSearchFilter(search: string | undefined): Prisma.UserWhereInput | undefined {
  if (!search) {
    return undefined;
  }
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  };
}

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
  // Check for a duplicate email before hashing — bcrypt is deliberately
  // slow (that's what makes it resistant to brute force), so there's no
  // reason to pay that cost on a request that's going to fail anyway.
  const hashedPassword = await hashPassword(input.password);
  return userRepository.create({ ...input, password: hashedPassword });
}

async function getUserById(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" was not found.`, 'USER_NOT_FOUND');
  }
  return user;
}

async function listUsers(query: ListUsersQuery): Promise<PaginatedResult<User>> {
  const { page, limit, sortBy, sortOrder, search } = query;
  const skip = (page - 1) * limit;
  const { users, total } = await userRepository.findManyPaginated({
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    where: buildSearchFilter(search),
  });
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

  // A password change must be hashed exactly like a new password — this
  // path stored plaintext until this step added it.
  const data =
    typeof input.password === 'string' ? { ...input, password: await hashPassword(input.password) } : input;

  return userRepository.update(id, data);
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
