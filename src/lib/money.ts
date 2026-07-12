/** Prices are stored in paise (INR minor units) to keep arithmetic integral. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatMinor(paise: number): string {
  return inr.format(Math.round(paise / 100));
}

export function rupeesToMinor(rupees: number): number {
  return Math.round(rupees * 100);
}

/** "₹ 6,100" / "6,100" / "6100/-" -> 610000 paise. Returns null if unparseable. */
export function parsePriceToMinor(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "").replace(/\/-$/, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return rupeesToMinor(n);
}
