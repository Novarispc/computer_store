"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SETTING_KEYS, getMedia, getSetting, type StoreSettings } from "@/lib/settings";
import type { Service } from "@data/services";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Deliberately loose validation: this form edits a large nested object
 * (company facts, address, staff directory, service lines) and the goal is to
 * let an admin trim or edit it freely — including deleting the whole staff
 * directory — without the schema fighting them. Structural shape is enforced
 * by TypeScript on the client; here we only guard against garbage.
 */
const StoreInput = z.looseObject({
  name: z.string().trim().min(1).max(120),
});

export async function updateStoreSettings(input: StoreSettings): Promise<ActionResult> {
  await requireAdmin();
  const parsed = StoreInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Store name is required." };

  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.store },
    create: { key: SETTING_KEYS.store, valueJson: JSON.stringify(input) },
    update: { valueJson: JSON.stringify(input) },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function updateServices(input: Service[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(input)) return { ok: false, error: "Invalid services payload." };

  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.services },
    create: { key: SETTING_KEYS.services, valueJson: JSON.stringify(input) },
    update: { valueJson: JSON.stringify(input) },
  });

  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { ok: true };
}

/** An image this app produced — a local upload path or a Vercel Blob URL. Never an arbitrary link. */
function isOwnImage(url: string): boolean {
  if (/^\/(uploads|brand)\/[A-Za-z0-9._-]+$/.test(url)) return true;
  try {
    return url.startsWith("https://") && new URL(url).host.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

const MediaValue = z
  .string()
  .nullable()
  .refine((v) => v === null || isOwnImage(v), "Upload the image rather than pasting a link.");

const MEDIA_SLOTS = ["servicesHero"] as const;

export async function updateMedia(slot: string, url: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!(MEDIA_SLOTS as readonly string[]).includes(slot)) {
    return { ok: false, error: "Unknown image slot." };
  }
  const parsed = MediaValue.safeParse(url);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid image." };

  const current = await getMedia();
  const next = { ...current, [slot]: parsed.data };

  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.media },
    create: { key: SETTING_KEYS.media, valueJson: JSON.stringify(next) },
    update: { valueJson: JSON.stringify(next) },
  });

  revalidatePath("/services");
  revalidatePath("/admin/branding");
  return { ok: true };
}

const BRAND_SLOTS = ["mascot", "logoFull"] as const;

/** Persist a brand-asset URL (logo or mascot) so getBrandAssets can find it. */
export async function updateBrandAsset(slot: string, url: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!(BRAND_SLOTS as readonly string[]).includes(slot)) {
    return { ok: false, error: "Unknown brand slot." };
  }
  const parsed = MediaValue.safeParse(url);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid image." };

  const current = await getSetting<Record<string, string | null>>(SETTING_KEYS.brand, {});
  const next = { ...current, [slot]: parsed.data };

  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.brand },
    create: { key: SETTING_KEYS.brand, valueJson: JSON.stringify(next) },
    update: { valueJson: JSON.stringify(next) },
  });

  // The lock-up and mascot appear in the root layout, so every route needs it.
  revalidatePath("/", "layout");
  revalidatePath("/admin/branding");
  return { ok: true };
}
