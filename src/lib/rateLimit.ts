type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

declare global {
  var rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = global.rateLimitStore ?? new Map<string, RateLimitEntry>();

if (!global.rateLimitStore) {
  global.rateLimitStore = store;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return (forwardedFor?.split(",")[0] ?? realIp ?? "unknown")
    .trim()
    .slice(0, 64);
}

function cleanupExpired(now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = store.get(input.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + input.windowMs;
    store.set(input.key, { count: 1, resetAt });

    return {
      allowed: true,
      limit: input.limit,
      remaining: Math.max(0, input.limit - 1),
      resetAt
    };
  }

  if (existing.count >= input.limit) {
    return {
      allowed: false,
      limit: input.limit,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  store.set(input.key, existing);

  return {
    allowed: true,
    limit: input.limit,
    remaining: Math.max(0, input.limit - existing.count),
    resetAt: existing.resetAt
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000))
  };
}
