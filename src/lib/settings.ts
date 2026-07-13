import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";
import type { Company } from "@data/company";
import type { Service } from "@data/services";

export const SETTING_KEYS = {
  store: "store",
  services: "services",
  media: "media",
  brand: "brand",
  auth: "auth",
} as const;

/** Uploaded page imagery, keyed by slot. Values are upload/blob URLs. */
export type MediaSettings = {
  servicesHero?: string | null;
};

/** The `store` Setting holds every editable company fact, including the directory. */
export type StoreSettings = Company;

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row ? safeJson<T>(row.valueJson, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const valueJson = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, valueJson },
    update: { valueJson },
  });
}

export async function getStore(): Promise<StoreSettings> {
  const { company } = await import("@data/company");
  return getSetting<StoreSettings>(SETTING_KEYS.store, company);
}

export async function getServices(): Promise<Service[]> {
  const { services } = await import("@data/services");
  return getSetting<Service[]>(SETTING_KEYS.services, services);
}

export async function getMedia(): Promise<MediaSettings> {
  return getSetting<MediaSettings>(SETTING_KEYS.media, {});
}
