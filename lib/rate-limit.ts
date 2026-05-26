import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type AuthRateLimitKind = "login" | "register" | "forgot-password" | "reset-password";

/** Per-IP limits for auth endpoints (Vercel-safe via Upstash Redis). */
const LIMITS: Record<
  AuthRateLimitKind,
  { requests: number; window: `${number} s` | `${number} m` | `${number} h` | `${number} d` }
> = {
  login: { requests: 5, window: "15 m" },
  register: { requests: 5, window: "1 h" },
  "forgot-password": { requests: 5, window: "1 h" },
  "reset-password": { requests: 5, window: "15 m" },
};

let redisClient: Redis | null = null;
const limiterCache = new Map<AuthRateLimitKind, Ratelimit>();

export function isRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis(): Redis | null {
  if (!isRateLimitConfigured()) return null;
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

function getLimiter(kind: AuthRateLimitKind): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  let limiter = limiterCache.get(kind);
  if (!limiter) {
    const { requests, window } = LIMITS[kind];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `rl:${kind}`,
      analytics: true,
    });
    limiterCache.set(kind, limiter);
  }
  return limiter;
}

/** Client IP for rate limiting behind Vercel / proxies. */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export type RateLimitCheckResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export async function checkAuthRateLimit(
  request: NextRequest,
  kind: AuthRateLimitKind
): Promise<RateLimitCheckResult> {
  const limiter = getLimiter(kind);
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`Rate limit skipped: Upstash env missing for ${kind}`);
    }
    return { allowed: true };
  }

  const ip = getClientIp(request);
  const { success, reset } = await limiter.limit(ip);

  if (success) {
    return { allowed: true };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000)
  );
  return { allowed: false, retryAfterSeconds };
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

/** Returns a 429 response when limited, or null to continue the handler. */
export async function enforceAuthRateLimit(
  request: NextRequest,
  kind: AuthRateLimitKind
): Promise<NextResponse | null> {
  const result = await checkAuthRateLimit(request, kind);
  if (result.allowed) return null;
  return rateLimitResponse(result.retryAfterSeconds);
}
