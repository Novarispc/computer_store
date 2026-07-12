"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export type LoginResult = { ok: false; error: string };

/** On success this redirects and never returns; on failure it returns an error. */
export async function login(formData: FormData): Promise<LoginResult> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password || !checkAdminPassword(password)) {
    return { ok: false, error: "Incorrect password." };
  }

  await setSessionCookie();
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
