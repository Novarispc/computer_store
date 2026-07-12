import { PRODUCT_SORTS, type ProductSort } from "@/lib/constants";
import type { ProductFilters } from "@/lib/queries";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

function rupeesToMinor(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

/** URL is the single source of truth for the catalogue view. */
export function parseFilters(sp: RawSearchParams): ProductFilters {
  const sortRaw = one(sp.sort);
  const sort = PRODUCT_SORTS.includes(sortRaw as ProductSort)
    ? (sortRaw as ProductSort)
    : undefined;

  const conditionRaw = one(sp.condition);
  const condition =
    conditionRaw === "NEW" || conditionRaw === "REFURBISHED" ? conditionRaw : undefined;

  const pageRaw = Number(one(sp.page));

  return {
    q: one(sp.q),
    category: one(sp.category),
    brand: one(sp.brand),
    minMinor: rupeesToMinor(one(sp.min)),
    maxMinor: rupeesToMinor(one(sp.max)),
    condition,
    sort,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

/** Build a querystring by patching the current one; null clears a key. */
export function buildQuery(
  current: RawSearchParams,
  patch: Record<string, string | number | null | undefined>
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const s = one(v);
    if (s) params.set(k, s);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") params.delete(k);
    else params.set(k, String(v));
  }
  // Any filter change invalidates the current page.
  if (!("page" in patch)) params.delete("page");
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function hasActiveFilters(f: ProductFilters): boolean {
  return Boolean(
    f.q || f.category || f.brand || f.condition || f.minMinor !== undefined || f.maxMinor !== undefined
  );
}
