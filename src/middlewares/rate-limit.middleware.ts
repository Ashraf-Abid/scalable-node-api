import rateLimit, { type RateLimitExceededEventHandler } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/app-error';
import { sendError } from '../utils/api-response';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Shared by both limiters below so an exceeded limit responds through the
// same { success: false, error: {...} } envelope as every other error in
// this API, instead of express-rate-limit's own plain-text default body.
const rateLimitHandler: RateLimitExceededEventHandler = (_req, res) => {
  const error = new TooManyRequestsError();
  sendError(res, error.statusCode, error.code, error.message);
};

// Applies to the whole API (mounted after /health, which stays exempt —
// load balancer / orchestrator health probes hit it far more often than
// 100 requests per 15 minutes and shouldn't be able to trip this).
export const generalLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Register/login are the classic brute-force and credential-stuffing
// targets, so they get a much tighter cap than the rest of the API —
// counted independently of, and in addition to, the general limiter
// above.
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});
