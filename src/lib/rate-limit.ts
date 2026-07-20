import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = { limit: number; windowMs: number };
type RateLimitEntry = { count: number; resetAt: number };
export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const entries = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;

function trimEntries(now: number): void {
  if (entries.size < MAX_ENTRIES) return;

  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(key);
  }

  if (entries.size >= MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value;
    if (oldestKey) entries.delete(oldestKey);
  }
}

/** Per-instance fallback for local development and Redis outages. */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now = Date.now()
): RateLimitResult {
  const entry = entries.get(key);

  if (!entry || entry.resetAt <= now) {
    trimEntries(now);
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimits(key?: string): void {
  if (key) {
    entries.delete(key);
    return;
  }
  entries.clear();
}

const hasSharedStore = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasSharedStore ? Redis.fromEnv() : null;
const publicSubmissions = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, "10 m"), prefix: "esquire:public-submission" })
  : null;
const adminLogins = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, "15 m"), prefix: "esquire:admin-login" })
  : null;

function fromSharedResult(result: { success: boolean; reset: number }): RateLimitResult {
  return {
    allowed: result.success,
    retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

/** Shared across Vercel instances when the Upstash integration is connected. */
export async function checkPublicSubmissionLimit(key: string): Promise<RateLimitResult> {
  if (!publicSubmissions) return checkRateLimit(key, { limit: 5, windowMs: 10 * 60 * 1000 });
  try {
    return fromSharedResult(await publicSubmissions.limit(key));
  } catch {
    // Preserve service availability while retaining best-effort local protection.
    return checkRateLimit(key, { limit: 5, windowMs: 10 * 60 * 1000 });
  }
}

/** Shared login guard. The fallback protects local development if Redis is unavailable. */
export async function checkAdminLoginLimit(key: string): Promise<RateLimitResult> {
  if (!adminLogins) return checkRateLimit(key, { limit: 5, windowMs: 15 * 60 * 1000 });
  try {
    return fromSharedResult(await adminLogins.limit(key));
  } catch {
    return checkRateLimit(key, { limit: 5, windowMs: 15 * 60 * 1000 });
  }
}

export async function resetAdminLoginLimit(key: string): Promise<void> {
  resetRateLimits(key);
  if (!adminLogins) return;
  try {
    await adminLogins.resetUsedTokens(key);
  } catch {
    // A failed reset only leaves the successful login counted; it does not weaken the limit.
  }
}
