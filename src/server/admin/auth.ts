"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdminPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { checkAdminLoginLimit, resetAdminLoginLimit } from "@/lib/rate-limit";

export type LoginResult = { ok: false; error: string };

function loginRateLimitKey(requestHeaders: Headers): string {
  const address =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  return "admin-login:" + address;
}

/** On success this redirects and never returns; on failure it returns an error. */
export async function login(formData: FormData): Promise<LoginResult> {
  const requestHeaders = await headers();
  const key = loginRateLimitKey(requestHeaders);
  const rateLimit = await checkAdminLoginLimit(key);
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in " + rateLimit.retryAfterSeconds + " seconds." };
  }

  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password || !(await checkAdminPassword(password))) {
    return { ok: false, error: "Incorrect password." };
  }

  await resetAdminLoginLimit(key);
  await setSessionCookie();
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
