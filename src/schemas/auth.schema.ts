import { z } from 'zod';

// Login's password only needs to be a non-empty string — the "at least 8
// characters" policy (user.schema.ts) is a registration-time rule about
// what passwords are allowed to exist, not a login-time check. A
// legitimately registered password is already valid by definition; this
// just rejects an empty/missing field before it reaches the service.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255).pipe(z.email('Must be a valid email address')),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
