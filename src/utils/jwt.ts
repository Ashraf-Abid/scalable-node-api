import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// `sub` (subject) is the standard JWT claim for "who is this token about".
// Deliberately minimal — a JWT's payload is signed, not encrypted, so
// it's readable by anyone with the token, not just the server. Anything
// beyond the user id (email, name, roles) should be looked up fresh from
// the database when needed, not trusted from the token itself.
export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    // jsonwebtoken types expiresIn as a template-literal union
    // ("1d", "2h", ...), not a plain string — env values are always
    // plain strings, so this cast is necessary, not defensive noise
    // (confirmed: removing it fails to compile).
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
