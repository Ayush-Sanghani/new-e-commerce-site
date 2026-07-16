import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type AuthRateLimitKind =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "resend-verification";

export type ApiRateLimitKind = "cart-mutation" | "profile-update" | "currency-preference";

export type RateLimitKind = AuthRateLimitKind | ApiRateLimitKind;

/** Per-IP limits for rate-limited endpoints (Vercel-safe via Upstash Redis). */
const LIMITS: Record<
  RateLimitKind,
  { requests: number; window: `${number} s` | `${number} m` | `${number} h` | `${number} d` }
> = {
  login: { requests: 5, window: "15 m" },
  register: { requests: 5, window: "1 h" },
  "forgot-password": { requests: 5, window: "1 h" },
  "reset-password": { requests: 5, window: "15 m" },
  "verify-email": { requests: 5, window: "15 m" },
  "resend-verification": { requests: 5, window: "1 h" },
  "cart-mutation": { requests: 60, window: "1 m" },
  "profile-update": { requests: 20, window: "10 m" },
  "currency-preference": { requests: 30, window: "1 m" },
};

let redisClient: Redis | null = null;
const limiterCache = new Map<RateLimitKind, Ratelimit>();

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

function getLimiter(kind: RateLimitKind): Ratelimit | null {
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
  | { allowed: false; retryAfterSeconds: number; reason?: "rate_limited" | "not_configured" };

export async function checkRateLimit(
  request: NextRequest,
  kind: RateLimitKind
): Promise<RateLimitCheckResult> {
  const limiter = getLimiter(kind);
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error(`Rate limit blocked: Upstash env missing for ${kind}`);
      return { allowed: false, retryAfterSeconds: 60, reason: "not_configured" };
    }
    console.warn(`Rate limit skipped in development: Upstash env missing for ${kind}`);
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
  return { allowed: false, retryAfterSeconds, reason: "rate_limited" };
}

/** @deprecated Use checkRateLimit. */
export const checkAuthRateLimit = checkRateLimit;

export function rateLimitResponse(
  retryAfterSeconds: number,
  reason: "rate_limited" | "not_configured" = "rate_limited"
): NextResponse {
  const isMisconfigured = reason === "not_configured";
  return NextResponse.json(
    {
      success: false,
      error: isMisconfigured
        ? "Authentication is temporarily unavailable. Please try again later."
        : "Too many requests. Please try again later.",
      retryAfterSeconds,
    },
    {
      status: isMisconfigured ? 503 : 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

/** Returns a 429 response when limited, or null to continue the handler. */
export async function enforceRateLimit(
  request: NextRequest,
  kind: RateLimitKind
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, kind);
  if (result.allowed) return null;
  return rateLimitResponse(result.retryAfterSeconds, result.reason);
}

/** @deprecated Use enforceRateLimit. */
export const enforceAuthRateLimit = enforceRateLimit;

/**
 * Rate limit guard for `{ success, message, data }`-shaped API routes (cart, profile).
 * Returns a 429/503 response when limited, or null to continue.
 */
export async function enforceApiRateLimit(
  request: NextRequest,
  kind: RateLimitKind
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, kind);
  if (result.allowed) return null;

  const isMisconfigured = result.reason === "not_configured";
  return NextResponse.json(
    {
      success: false,
      message: isMisconfigured
        ? "Service is temporarily unavailable. Please try again later."
        : "Too many requests. Please slow down and try again.",
      data: { retryAfterSeconds: result.retryAfterSeconds },
    },
    {
      status: isMisconfigured ? 503 : 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    }
  );
}
