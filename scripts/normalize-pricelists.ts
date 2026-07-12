/**
 * Turns the text extracted from Esquire's public price-list PDFs into a
 * committed, reviewable data/products.json.
 *
 * The extracted text has no column delimiters:
 *
 *   LENOVO 19'' D19185AD0 TN1366 x 768 VGA+ HDMI YES 3YR NO ₹ 6,100
 *
 * so a row is recovered by treating the PRICE as the row terminator and
 * everything since the previous price as that row's payload. Several lists
 * also print the brand once and let following rows inherit it, so the brand
 * carries forward until a new one is seen.
 *
 * Parsing this is lossy by nature. Every rejected row is reported with its raw
 * text rather than silently dropped — the skip report is the signal that the
 * output needs a human pass. products.json is committed and hand-correctable.
 *
 *   npm run normalize
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { brands, brandAliasIndex } from "../data/brands.js";
import { priceLists, type PriceList } from "../data/categories.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const RAW = resolve(ROOT, "data/pricelists_raw.txt");
const OUT = resolve(ROOT, "data/products.json");

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

const SpecSchema = z.object({ key: z.string().min(1), value: z.string().min(1) });

const ProductSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  model: z.string().nullable(),
  brandSlug: z.string().nullable(),
  categorySlug: z.string().min(1),
  condition: z.enum(["NEW", "REFURBISHED"]),
  priceMinor: z.int().positive(),
  warranty: z.string().nullable(),
  shortDesc: z.string().nullable(),
  specs: z.array(SpecSchema),
});

export type ProductSeed = z.infer<typeof ProductSchema>;

type Skip = { list: string; reason: string; raw: string };

// ---------------------------------------------------------------------------
// Text cleaning
// ---------------------------------------------------------------------------

/** Footer/boilerplate that repeats on every page and must never enter a row. */
const NOISE = [
  /NB\s*:?\s*PLEASE VERIFY[\s\S]*?(?=$)/gi,
  /ESQUIRE SERVICE[\s\S]*?(?=$)/gi,
  /\b\d{2}-\d{2}-\d{4}\b/g, // 04-04-2026 date stamps
  /PRICES? ARE SUBJECT TO CHANGE[^\n]*/gi,
];

function clean(text: string): string {
  let out = text.replace(/ /g, " ");
  for (const re of NOISE) out = out.replace(re, " ");
  return out.replace(/[ \t]+/g, " ");
}

/**
 * A price token, and only a price token.
 *
 * With a rupee sign anything goes. Without one we insist on comma grouping
 * (2,900 / 1,01,800) — a bare run of digits is far more likely to be a spec
 * (512GB, 144Hz, 1920, 12V) than a price, so bare matching is opt-in per list.
 *
 * Note there is no \b before the digits. Columns are concatenated with no
 * separator, so a price is routinely glued to the cell before it —
 * "1YR2,900", "WIFI33,300/-" — and a word boundary never fires between a
 * letter and a digit. A lookbehind for digits/separators is the correct guard:
 * it still refuses to start mid-number (the "2,900" inside "12,900").
 */
const RUPEE_PRICE = String.raw`₹\s*\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?`;
const BARE_PRICE = String.raw`(?<![\d.,])\d{1,3}(?:,\d{2,3})+(?:\.\d{2})?(?!\d)\s*(?:\/-)?`;

function priceRegex(bareNumbers: boolean): RegExp {
  return new RegExp(bareNumbers ? `${RUPEE_PRICE}|${BARE_PRICE}` : RUPEE_PRICE, "g");
}

function toMinor(token: string): number | null {
  const cleaned = token.replace(/[₹,\s]/g, "").replace(/\/-$/, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

// ---------------------------------------------------------------------------
// Field extraction
// ---------------------------------------------------------------------------

/** How far into a row we will look for a brand. See findBrand. */
const BRAND_WINDOW = 150;

/**
 * The brand is not reliably at index 0. Each list's first row swallows the
 * table header ("GRAPHICS & GAMING MODELSMODEL CPU ... SUPPORT" then "ACER"),
 * and section headings glue onto the row beneath them ("IN-BUILT UPS
 * OFFLINE" + "FOXIN"). So find the EARLIEST alias that begins a token and
 * treat everything before it as chrome.
 *
 * A brand must not start mid-word — that is what keeps "LG" out of "ALG
 * GAMING" — but it may run straight into the model, because the PDF prints
 * "HPPROBOOK" and "DELLAIO" with no space. Earliest-wins also means a Canon
 * row is never captured by the "HP 805" cartridge named later in its own spec.
 */
function findBrand(payload: string): { slug: string; rest: string } | null {
  const upper = payload.slice(0, BRAND_WINDOW).toUpperCase();
  let best: { slug: string; start: number; end: number } | null = null;

  for (const { alias, slug } of brandAliasIndex) {
    const i = upper.indexOf(alias);
    if (i === -1) continue;
    const prev = i === 0 ? "" : upper.charAt(i - 1);
    // A short alias must start a token, or "LG" matches inside "ALG GAMING" and
    // "HP" inside any word ending in ...H. A long alias may start mid-word,
    // because headings are printed flush against it: "SUPPORT19 INCHFOXIN",
    // "PRICEACERASPIRE", "DESKTOPSDELLAIO". Four characters is the safe floor.
    if (prev && /[A-Z]/.test(prev) && alias.length < 4) continue;
    if (!best || i < best.start) best = { slug, start: i, end: i + alias.length };
  }

  if (!best) return null;
  return { slug: best.slug, rest: payload.slice(best.end).trim() };
}

const WARRANTY = /\b(\d+)\s*(?:YR|YRS|YEAR|YEARS)\b/i;

/** Model = the leading run before the first thing that smells like a spec. */
const SPEC_ONSET =
  /\b(?:i[3579][-\s]|CORE|RYZEN|R[357]-|INTEL|\d+\s*GB|\d+GB|\d+\s*TB|TN|VA|IPS|\d{3,4}\s*[x*]\s*\d{3,4}|\d{2,3}(?:\.\d)?\s*(?:''|"|INCH)|DOS|WIN\s*1[01]|SINGLE FUNCTION|PRINT[,\s]|\d+CH\b|\d+MP\b|\d+VA\b|\d+KVA\b|\d+AH\b|\d+V\b)/i;

/**
 * Tokens that look model-ish but are demonstrably a spec. The second branch
 * catches a size welded to a panel/resolution word — 24FHD, 22IPS, 27LED —
 * which otherwise passes the "has letters and digits" test.
 */
const NOT_A_MODEL =
  /^(?:\d+\s*(?:GB|TB|MB|VA|KVA|AH|V|CH|MP|HZ|PPM|DPI)|\d+\s*YRS?|\d{3,4}\s*[x*X]\s*\d{3,4}|\d{2}(?:FHD|HD|QHD|UHD|LED|IPS|VA|TN)|TN|VA|IPS|DOS|YES|NO|FHD|HD|LED|WIN\d*)$/i;

/**
 * "BORDERLESS22MR410" -> "22MR410": a descriptor welded onto a part number.
 * The captured tail must carry a letter after its digits, otherwise "CRYSTAL19"
 * — where the whole token IS the part number — would be shaved down to "19".
 */
const GLUED_PART_NUMBER = /^[A-Z]{4,}(\d{2,}[A-Z][A-Z0-9-]*)$/i;

/**
 * Rows in the display lists open with the panel size ("LG 19\" 19M38H TN ..."),
 * so the spec onset lands at index 0 and there is no leading run to take as a
 * model. Fall back to the first token that actually looks like a part number:
 * letters AND digits, four or more characters, and not a spec in disguise.
 */
function findModelCode(rest: string): string | null {
  for (const token of rest.slice(0, 90).split(/[\s,]+/)) {
    const t = token.replace(/["”'']/g, "").replace(/[-:]+$/, "");
    if (t.length < 4) continue;
    if (NOT_A_MODEL.test(t)) continue;
    if (!/[A-Za-z]/.test(t) || !/\d/.test(t)) continue;
    const glued = t.match(GLUED_PART_NUMBER);
    return glued ? glued[1] : t;
  }
  return null;
}

/**
 * PDF extraction runs adjacent cells together — "AIOPrint", "wirelessPrint",
 * "512GB SSDDOS14\"". SPEC_ONSET anchors on \b, which never fires between two
 * letters, so the onset is invisible until the case transitions are split.
 * Only used to locate the boundary; the original row text is left untouched.
 */
function deglue(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2") // wirelessPrint -> wireless Print
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1 $2") // AIOPrint    -> AIO Print
    .replace(/(\d)([A-Z]{3,})/g, "$1 $2") // TS-207SINGLE -> TS-207 SINGLE
    .replace(/(\d)(i[3579][-\s])/gi, "$1 $2"); // 14-36i3-1305U -> 14-36 i3-1305U
}

/** A model is a part number, not a sentence. Cut on a word boundary. */
function capModel(model: string): string {
  if (model.length <= 34) return model;
  const cut = model.slice(0, 34);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 8 ? cut.slice(0, lastSpace) : cut).trim();
}

function splitModel(rest: string): { model: string | null; tail: string } {
  const probe = deglue(rest);
  const m = probe.search(SPEC_ONSET);
  if (m > 0) {
    const model = probe.slice(0, m).trim().replace(/[-,:]+$/, "").trim();
    if (model) return { model: capModel(model), tail: probe.slice(m).trim() };
  }
  const code = findModelCode(probe);
  return { model: code ? capModel(code) : null, tail: probe };
}

const SPEC_PATTERNS: { key: string; re: RegExp }[] = [
  { key: "Processor", re: /\b((?:INTEL\s+)?(?:CORE\s+)?(?:i[3579]|R[357]|RYZEN\s*\d)[-\s]?[\w-]*)/i },
  { key: "Memory", re: /\b(\d+\s*GB(?:\s*(?:DDR\d|LPDDR\d))?)\b/i },
  { key: "Storage", re: /\b(\d+\s*(?:GB|TB)\s*(?:SSD|HDD))\b/i },
  { key: "Display", re: /\b(\d{2}(?:\.\d)?\s*(?:''|"|”|INCH))/i },
  { key: "Resolution", re: /\b(\d{3,4}\s*[x*X]\s*\d{3,4})\b/i },
  { key: "Panel", re: /\b(TN|VA|IPS)\b/ },
  { key: "Refresh rate", re: /\b(\d{2,3}\s*Hz)\b/i },
  { key: "Graphics", re: /\b(RTX\s*\d{4}\s*\d*\s*GB?|GTX\s*\d{3,4})/i },
  { key: "Operating system", re: /\b(WIN\s*1[01][^,₹]{0,18}|DOS)\b/i },
  { key: "Connectivity", re: /\b((?:VGA|HDMI|DP|USB[\w\s-]{0,8})(?:\s*\+\s*(?:VGA|HDMI|DP))*)/i },
  { key: "Capacity", re: /\b(\d+(?:\.\d+)?\s*(?:KVA|VA|AH))\b/i },
  { key: "Voltage", re: /\b(\d+\s*V)\b/ },
];

function extractSpecs(tail: string): { key: string; value: string }[] {
  const specs: { key: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const { key, re } of SPEC_PATTERNS) {
    const m = tail.match(re);
    if (!m) continue;
    const value = m[1].trim().replace(/\s+/g, " ").slice(0, 60);
    if (!value || seen.has(key)) continue;
    seen.add(key);
    specs.push({ key, value });
  }
  return specs;
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseTabular(list: PriceList, body: string, skips: Skip[]): ProductSeed[] {
  const text = clean(body);
  const re = priceRegex(Boolean(list.bareNumbers));

  const out: ProductSeed[] = [];
  let cursor = 0;
  let lastBrand: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const payloadRaw = text.slice(cursor, match.index).trim();
    cursor = match.index + match[0].length;

    const priceMinor = toMinor(match[0]);
    if (priceMinor === null) continue;

    // Strip a leading serial number ("13HP ELITE BOOK..." in the refurb list).
    const payload = payloadRaw.replace(/^\d{1,3}(?=[A-Z])/, "").trim();
    if (!payload) continue;

    // Rows below ₹500 or above ₹10,00,000 are almost certainly a spec fragment
    // that matched the bare-number pattern, not a price.
    if (priceMinor < 50_000 || priceMinor > 100_000_000) {
      skips.push({ list: list.id, reason: `implausible price ${match[0]}`, raw: payload.slice(0, 90) });
      continue;
    }

    const brandHit = findBrand(payload);
    const brandSlug = brandHit?.slug ?? lastBrand;
    if (brandHit) lastBrand = brandHit.slug;

    const rest = brandHit ? brandHit.rest : payload;
    const { model, tail } = splitModel(rest);

    // Header rows ("BRAND MODEL PROC MEM HDD MON OS WTY PRICE") carry no brand
    // and no inheritable context.
    if (!brandSlug && !model) {
      skips.push({ list: list.id, reason: "no brand and no model", raw: payload.slice(0, 90) });
      continue;
    }

    const brandName = brandSlug ? brandLabel(brandSlug) : null;
    const nameParts = [brandName, model].filter(Boolean) as string[];
    const name = nameParts.join(" ").trim();
    if (name.length < 3) {
      skips.push({ list: list.id, reason: "name too short", raw: payload.slice(0, 90) });
      continue;
    }

    const warrantyMatch = rest.match(WARRANTY);
    out.push({
      slug: "",
      name,
      model,
      brandSlug,
      categorySlug: list.categorySlug,
      condition: list.condition ?? "NEW",
      priceMinor,
      warranty: warrantyMatch ? `${warrantyMatch[1]} year${warrantyMatch[1] === "1" ? "" : "s"}` : null,
      shortDesc: squash(tail) || null,
      specs: extractSpecs(tail),
    });
  }

  return out;
}

/** The furniture list is genuinely newline-delimited: code, name, spec block, price. */
function parseFurniture(list: PriceList, body: string, skips: Skip[]): ProductSeed[] {
  const lines = clean(body)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: ProductSeed[] = [];
  const CODE = /^([A-Z]{2,4}-\d{2,4})$/;
  const PRICE = /^\d{1,3}(?:,\d{2,3})+(?:\.\d{2})?$/;

  let code: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const codeHit = line.match(CODE);
    if (codeHit) {
      code = codeHit[1];
      buffer = [];
      continue;
    }
    if (!code) continue;

    if (PRICE.test(line)) {
      const priceMinor = toMinor(line);
      const title = buffer[0]?.trim();
      if (priceMinor === null || !title) {
        skips.push({ list: list.id, reason: "price without a title", raw: `${code} ${line}` });
        code = null;
        continue;
      }
      out.push({
        slug: "",
        name: title,
        model: code,
        brandSlug: null, // The list names no per-item brand.
        categorySlug: list.categorySlug,
        condition: "NEW",
        priceMinor,
        warranty: null,
        shortDesc: squash(buffer.slice(1).join(" ")) || null,
        specs: [{ key: "Code", value: code }],
      });
      code = null;
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BRAND_NAMES = new Map(brands.map((b) => [b.slug, b.name]));

function brandLabel(slug: string): string {
  return BRAND_NAMES.get(slug) ?? slug;
}

function squash(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 180);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const raw = readFileSync(RAW, "utf8");
  const parts = raw.split(/=+ (\S+\.pdf) \(\d+p, \d+ chars\)/);
  const blocks = new Map<string, string>();
  for (let i = 1; i < parts.length; i += 2) blocks.set(parts[i].replace(".pdf", ""), parts[i + 1]);

  const skips: Skip[] = [];
  const all: ProductSeed[] = [];
  const report: string[] = [];

  for (const list of priceLists) {
    const body = blocks.get(list.id);
    if (!body) {
      report.push(`  ${list.id}  ${list.categorySlug.padEnd(22)}  MISSING from raw text`);
      continue;
    }
    if (list.shape === "skip") {
      report.push(`  ${list.id}  ${list.categorySlug.padEnd(22)}  SKIPPED — ${list.skipReason}`);
      continue;
    }

    const parsed =
      list.shape === "furniture" ? parseFurniture(list, body, skips) : parseTabular(list, body, skips);

    const kept: ProductSeed[] = [];
    for (const p of parsed) {
      p.slug = slugify([p.brandSlug, p.model ?? p.name].filter(Boolean).join("-"));
      const result = ProductSchema.safeParse(p);
      if (!result.success) {
        skips.push({
          list: list.id,
          reason: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
          raw: `${p.name} @ ${p.priceMinor}`,
        });
        continue;
      }
      kept.push(result.data);
    }

    const listSkips = skips.filter((s) => s.list === list.id).length;
    report.push(
      `  ${list.id}  ${list.categorySlug.padEnd(22)}  parsed ${String(kept.length).padStart(3)}   skipped ${String(listSkips).padStart(3)}`
    );
    all.push(...kept);
  }

  // Dedupe on the whole row, not just (brand, model, price). Model extraction
  // is coarse enough that two genuinely different monitors can share a model
  // string; folding in the row text keeps them apart. A true duplicate — the
  // same line printed twice across pages — still collapses.
  const seen = new Set<string>();
  const deduped: ProductSeed[] = [];
  for (const p of all) {
    const fingerprint = [
      p.categorySlug,
      p.brandSlug,
      p.model,
      p.priceMinor,
      p.shortDesc ?? "",
    ].join("|");
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    deduped.push(p);
  }

  const slugCount = new Map<string, number>();
  for (const p of deduped) {
    const base = p.slug || slugify(p.name);
    const n = (slugCount.get(base) ?? 0) + 1;
    slugCount.set(base, n);
    p.slug = n === 1 ? base : `${base}-${n}`;
  }

  writeFileSync(OUT, JSON.stringify(deduped, null, 2) + "\n", "utf8");

  console.log("\nPer-list results");
  console.log(report.join("\n"));
  console.log(`\n  kept ${deduped.length} products (${all.length - deduped.length} duplicates removed)`);
  console.log(`  skipped ${skips.length} rows\n`);

  if (skips.length) {
    console.log("Skipped rows (first 25) — review these, they are not silently dropped:");
    for (const s of skips.slice(0, 25)) {
      console.log(`  [${s.list}] ${s.reason}\n         ${JSON.stringify(s.raw)}`);
    }
    if (skips.length > 25) console.log(`  … and ${skips.length - 25} more`);
  }

  console.log(`\nWrote ${OUT}`);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
