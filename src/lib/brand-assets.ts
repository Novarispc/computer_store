import { getSetting, SETTING_KEYS } from "@/lib/settings";

/**
 * The brand artwork is uploaded through the admin panel (Branding) and stored
 * as URLs in a Setting row, not on the filesystem — Vercel's runtime disk is
 * read-only, and uploads live in Blob storage, so there is nothing to scan.
 *
 *   public/... or blob URL  →  Setting["brand"] = { mascot, logoFull }
 *
 * Consumers (header, footer, admin sidebar, the mascot intro) read this and
 * swap to the real art automatically; until it's set, the drawn SVG stand-ins
 * in src/components/brand/logo.tsx are used.
 */

export type BrandAssets = {
  mascot: string | null;
  logoFull: string | null;
};

const EMPTY: BrandAssets = { mascot: null, logoFull: null };

export async function getBrandAssets(): Promise<BrandAssets> {
  const stored = await getSetting<Partial<BrandAssets>>(SETTING_KEYS.brand, EMPTY);
  return {
    mascot: stored.mascot ?? null,
    logoFull: stored.logoFull ?? null,
  };
}
