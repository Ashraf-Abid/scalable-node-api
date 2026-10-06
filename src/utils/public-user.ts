import type { User } from '@prisma/client';

// Never send the password hash back to a client, in any response shape.
// Shared by every controller that returns a User — duplicating this logic
// per controller would risk one copy silently forgetting the redaction.
export function toPublicUser(user: User) {
  const { password, ...publicUser } = user;
  return publicUser;
}

export type PublicUser = ReturnType<typeof toPublicUser>;
