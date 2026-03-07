interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __inkforgeRateLimitStore: Map<string, Bucket> | undefined;
}

const store = global.__inkforgeRateLimitStore ?? new Map<string, Bucket>();
if (!global.__inkforgeRateLimitStore) {
  global.__inkforgeRateLimitStore = store;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      ok: true,
      remaining: Math.max(config.maxRequests - 1, 0),
      resetAt,
      retryAfterMs: 0,
    };
  }

  if (bucket.count >= config.maxRequests) {
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterMs: Math.max(bucket.resetAt - now, 0),
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    ok: true,
    remaining: Math.max(config.maxRequests - bucket.count, 0),
    resetAt: bucket.resetAt,
    retryAfterMs: 0,
  };
}

export const RATE_LIMITS = {
  strict: { windowMs: 60_000, maxRequests: 20 },
  standard: { windowMs: 60_000, maxRequests: 40 },
  relaxed: { windowMs: 60_000, maxRequests: 120 },
};
