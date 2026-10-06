import type { PublicUser } from '../utils/public-user';

// Augments Express's own Request type so req.user is recognized
// everywhere, instead of every authenticated route handler needing an
// `as` cast. Populated by the authenticate middleware (Step 35) — only
// present on routes that actually use it (Step 36), hence optional.
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
