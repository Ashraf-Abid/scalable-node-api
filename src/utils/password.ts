import bcrypt from 'bcryptjs';

// 12 rounds is a reasonable modern default: expensive enough to resist
// brute-force/rainbow-table attacks, cheap enough not to meaningfully
// slow down registration/login. bcrypt's cost factor is exponential —
// each +1 round roughly doubles hashing time.
const SALT_ROUNDS = 12;

export function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export function comparePassword(plainTextPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hash);
}
