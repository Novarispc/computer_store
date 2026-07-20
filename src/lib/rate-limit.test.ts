import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

afterEach(resetRateLimits);

describe("checkRateLimit", () => {
  it("allows requests until the limit is reached", () => {
    expect(checkRateLimit("contact:127.0.0.1", { limit: 2, windowMs: 1_000 }, 10).allowed).toBe(true);
    expect(checkRateLimit("contact:127.0.0.1", { limit: 2, windowMs: 1_000 }, 11).allowed).toBe(true);
    expect(checkRateLimit("contact:127.0.0.1", { limit: 2, windowMs: 1_000 }, 12)).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it("allows a request after the window expires", () => {
    checkRateLimit("quote:127.0.0.1", { limit: 1, windowMs: 1_000 }, 10);
    expect(checkRateLimit("quote:127.0.0.1", { limit: 1, windowMs: 1_000 }, 1_010).allowed).toBe(true);
  });
});
