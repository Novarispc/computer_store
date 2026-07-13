import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * scrypt, not bcrypt: no new dependency (node:crypto is built in), and this
 * only ever runs from Node-runtime code — the login Server Action and the
 * seed script — never from src/proxy.ts, which stays edge/jose-only for
 * session-cookie verification. Password hashing and session verification are
 * deliberately different mechanisms for different runtimes.
 */

const KEYLEN = 64;

/** "saltHex:hashHex" — one string, safe to store as a Setting value. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, expected.length);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
