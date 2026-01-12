import { rateLimiter } from 'hono-rate-limiter';

export const quotesRateLimit = rateLimiter({
  windowMs: 60_000,
  limit: 100,
  keyGenerator: (c) => {
    return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'anonymous';
  },
  handler: (c) => {
    return c.json(
      {
        error: 'Too many requests',
        retryAfter: 60,
      },
      429,
    );
  },
});
