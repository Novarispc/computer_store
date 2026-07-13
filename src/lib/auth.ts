import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";
import { SETTING_KEYS } from "@/lib/settings";
import { verifyPassword } from "@/lib/password";

/**
 * Single admin password, HMAC-signed HttpOnly cookie. No user table, no
 * next-auth — there are no customer accounts in this app, only one operator.
 *
 * The session cookie is jose/Web Crypto throughout (works in edge
 * middleware — see src/proxy.ts). The password itself is hashed with
 * node:crypto scrypt and stored in the `auth` Setting row, seeded once by
 * prisma/seed.ts. This file's DB access only ever runs from Node-runtime
 * Server Actions, never from proxy.ts, so mixing Prisma in here is fine —
 * it's checkAdminPassword() specifically that would break at the edge, and
 * that function is never imported by proxy.ts.
 */

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short. Set it in .env.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  if (!input) return false;

  const row = await prisma.setting.findUnique({ where: { key: SETTING_KEYS.auth } });
  const { passwordHash } = safeJson<{ passwordHash?: string }>(row?.valueJson, {});
  if (!passwordHash) return false;

  return verifyPassword(input, passwordHash);
}

export async function setSessionCookie(): Promise<void> {
  const token = await createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** True if the current request carries a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Defense in depth: middleware guards page routes, but every server action
 * that mutates data calls this too, since middleware is not a substitute for
 * per-action authorization.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Not authorized.");
  }
}
