import { z } from 'zod';

/**
 * Validates the request body for creating a user. This is the single
 * source of truth for "what does a valid user look like" — the future
 * controller (Step 21) validates against this before the request ever
 * reaches the service layer, and its inferred type doubles as the input
 * type for userService.createUser, so the shape can't drift between
 * validation and business logic.
 */
export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  // Trim/lowercase must happen *before* the email format check, not
  // after — chaining .email() first validates the raw, untrimmed input,
  // so "  a@b.com  " would fail even though it's a valid email once
  // normalized. .pipe() runs the string transform first, then hands the
  // result to z.email() for format validation.
  email: z.string().trim().toLowerCase().max(255).pipe(z.email('Must be a valid email address')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Same shape as create, but every field is optional — a PATCH-style
// update only needs to send what's changing. At least one field must
// still be present, otherwise there's nothing to update.
export const updateUserSchema = createUserSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Validates the :id route param used by get/update/delete — our primary
// key is a native Postgres UUID (Step 11), so anything else is invalid
// before it ever reaches the database.
export const userIdParamSchema = z.object({
  id: z.uuid('Must be a valid user id'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
