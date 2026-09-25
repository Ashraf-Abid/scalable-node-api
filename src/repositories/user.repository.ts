import type { Prisma, User } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Database access only — no business rules, no validation, no HTTP
 * concerns. Callers (the User Service, Step 16) decide what these
 * operations mean; this layer only knows how to talk to Postgres via
 * Prisma. Equivalent to a Spring Data JPA repository, minus the DI
 * container — Node's module cache is what makes `prisma` (and this
 * repository) effectively a singleton across the app.
 */
export const userRepository = {
  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findManyPaginated(params: { skip: number; take: number }): Promise<{ users: User[]; total: number }> {
    // A transaction pairs the page of rows with the total count as one
    // consistent read — without it, a row inserted/deleted between the two
    // separate queries could make `total` disagree with what was actually
    // paged through. orderBy is required, not optional: without an
    // explicit order, Postgres doesn't guarantee row order at all, so
    // "page 2" could repeat or skip rows relative to "page 1".
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ skip: params.skip, take: params.take, orderBy: { createdAt: 'asc' } }),
      prisma.user.count(),
    ]);
    return { users, total };
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },
};
