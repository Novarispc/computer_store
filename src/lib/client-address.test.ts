import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientAddress } from "./client-address";

afterEach(() => vi.unstubAllEnvs());

describe("getClientAddress", () => {
  it("uses Vercel's protected forwarding header", () => {
    vi.stubEnv("VERCEL", "1");
    const headers = new Headers({
      "x-vercel-forwarded-for": "203.0.113.8",
      "x-forwarded-for": "198.51.100.9",
    });
    expect(getClientAddress(headers)).toBe("203.0.113.8");
  });

  it("does not trust generic forwarding headers without opt-in", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TRUST_PROXY_HEADERS", "false");
    expect(getClientAddress(new Headers({ "x-forwarded-for": "203.0.113.8" }))).toBeNull();
  });

  it("accepts only valid IP addresses from an explicitly trusted proxy", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TRUST_PROXY_HEADERS", "true");
    expect(getClientAddress(new Headers({ "x-forwarded-for": "2001:db8::1, 10.0.0.1" }))).toBe("2001:db8::1");
    expect(getClientAddress(new Headers({ "x-forwarded-for": "spoofed" }))).toBeNull();
  });
});
