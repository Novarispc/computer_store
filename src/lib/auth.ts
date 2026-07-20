import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";
import { SETTING_KEYS } from "@/lib/settings";
import { verifyPassword } from "@/lib/password";

const SESSION_TTL_SECONDS = 60 * 60 * 12;
const SESSION_ISSUER = "esquire-tech";
const SESSION_AUDIENCE = "admin";

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(SESSION_TTL_SECONDS + "s")
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
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
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    priority: "high",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Not authorized.");
  }
}
