import { isIP } from "node:net";

function firstValidIp(value: string | null): string | null {
  const candidate = value?.split(",", 1)[0]?.trim();
  return candidate && isIP(candidate) ? candidate : null;
}

/**
 * Resolve a rate-limit identity only from a trusted ingress contract.
 * Vercel overwrites x-vercel-forwarded-for. Other proxies must be explicitly
 * opted in and configured to strip client-supplied forwarding headers.
 */
export function getClientAddress(requestHeaders: Headers): string | null {
  if (process.env.VERCEL === "1") {
    return firstValidIp(requestHeaders.get("x-vercel-forwarded-for"));
  }

  if (process.env.TRUST_PROXY_HEADERS === "true") {
    return firstValidIp(requestHeaders.get("x-forwarded-for"));
  }

  return null;
}
