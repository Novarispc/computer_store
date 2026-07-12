/**
 * Idempotent seed. Safe to run repeatedly: every write is an upsert keyed on a
 * natural unique column, so re-running never duplicates rows and never clobbers
 * an admin's edits to the active theme.
 *
 *   npm run setup     # db push + seed
 *   npm run db:seed   # seed only
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { categories } from "../data/categories.js";
import { brands } from "../data/brands.js";
import { themes } from "../data/themes.js";
import { company } from "../data/company.js";
import { services } from "../data/services.js";

const prisma = new PrismaClient();
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type ProductSeed = {
  slug: string;
  name: string;
  model: string | null;
  brandSlug: string | null;
  categorySlug: string;
  condition: "NEW" | "REFURBISHED";
  priceMinor: number;
  warranty: string | null;
  shortDesc: string | null;
  specs: { key: string; value: string }[];
};

async function main() {
  console.log("Seeding Esquire Tech…\n");

  // -- Categories -----------------------------------------------------------
  const categoryIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        featured: c.featured ?? false,
        position: i,
      },
      update: { name: c.name, description: c.description, icon: c.icon, position: i },
    });
    categoryIds.set(c.slug, row.id);
  }
  console.log(`  categories  ${categories.length}`);

  // -- Brands ---------------------------------------------------------------
  const brandIds = new Map<string, string>();
  for (const b of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      create: { slug: b.slug, name: b.name, featured: b.featured ?? false },
      update: { name: b.name },
    });
    brandIds.set(b.slug, row.id);
  }
  console.log(`  brands      ${brands.length}`);

  // -- Products -------------------------------------------------------------
  const products: ProductSeed[] = JSON.parse(
    readFileSync(resolve(ROOT, "data/products.json"), "utf8")
  );

  // Feature a spread across categories rather than the first N of one list.
  const featuredSlugs = new Set<string>();
  const byCategory = new Map<string, ProductSeed[]>();
  for (const p of products) {
    const list = byCategory.get(p.categorySlug) ?? [];
    list.push(p);
    byCategory.set(p.categorySlug, list);
  }
  for (const list of byCategory.values()) {
    for (const p of [...list].sort((a, b) => b.priceMinor - a.priceMinor).slice(0, 2)) {
      featuredSlugs.add(p.slug);
    }
  }

  for (const [i, p] of products.entries()) {
    const categoryId = categoryIds.get(p.categorySlug) ?? null;
    const brandId = p.brandSlug ? (brandIds.get(p.brandSlug) ?? null) : null;

    const data = {
      name: p.name,
      model: p.model,
      description: p.shortDesc ?? "",
      shortDesc: p.shortDesc,
      categoryId,
      brandId,
      priceMinor: p.priceMinor,
      condition: p.condition,
      warranty: p.warranty,
      featured: featuredSlugs.has(p.slug),
      active: true,
      position: i,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });

    // Specs are fully derived from the price list, so replace rather than merge.
    await prisma.productSpec.deleteMany({ where: { productId: product.id } });
    if (p.specs.length) {
      await prisma.productSpec.createMany({
        data: p.specs.map((s, j) => ({
          productId: product.id,
          key: s.key,
          value: s.value,
          position: j,
        })),
      });
    }
  }
  console.log(`  products    ${products.length} (${featuredSlugs.size} featured)`);

  // -- Themes ---------------------------------------------------------------
  // `active` is only set on create. Re-seeding must not yank the theme an admin
  // has chosen back to the default.
  const existingActive = await prisma.theme.findFirst({ where: { active: true } });
  for (const [i, t] of themes.entries()) {
    await prisma.theme.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        active: existingActive ? false : Boolean(t.active),
        lightJson: JSON.stringify(t.light),
        darkJson: JSON.stringify(t.dark),
        position: i,
      },
      update: {
        name: t.name,
        description: t.description,
        lightJson: JSON.stringify(t.light),
        darkJson: JSON.stringify(t.dark),
        position: i,
      },
    });
  }
  console.log(`  themes      ${themes.length}${existingActive ? ` (kept "${existingActive.slug}" active)` : ""}`);

  // -- Homepage sections ----------------------------------------------------
  // Seed the Highlights row with the priciest product from a few flagship
  // categories, so the section is populated before an admin ever opens it.
  const highlightSeed = ["laptops", "gaming-laptops", "monitors", "printers"]
    .flatMap((slug) => {
      const list = byCategory.get(slug) ?? [];
      const top = [...list].sort((a, b) => b.priceMinor - a.priceMinor)[0];
      return top ? [top.slug] : [];
    })
    .slice(0, 8);

  // Position is the array index — keeping them in sync by hand invites collisions.
  const sections: {
    type: string;
    title: string | null;
    subtitle: string | null;
    dataJson?: string;
  }[] = [
    { type: "HERO", title: company.tagline, subtitle: company.coverage },
    {
      type: "HIGHLIGHTS",
      title: "This month's highlights",
      subtitle: "Hand-picked from the current price list.",
      dataJson: JSON.stringify({ slugs: highlightSeed }),
    },
    {
      type: "CATEGORY_GRID",
      title: "Shop by category",
      subtitle: "Twenty-one categories, one supplier, one service desk.",
    },
    {
      type: "FEATURED",
      title: "Featured hardware",
      subtitle: "Picked from this month's price list.",
    },
    { type: "BRANDS", title: "Brands we carry", subtitle: null },
    {
      type: "SERVICES",
      title: "Service, not just sales",
      subtitle: "Twenty engineers and an ISO 9001:2015 process behind every invoice.",
    },
    { type: "TRUST", title: null, subtitle: null },
    {
      type: "CTA",
      title: "Need a quote?",
      subtitle: "Build a list, send it over, and we will price it for you.",
    },
  ];

  for (const [i, s] of sections.entries()) {
    const existing = await prisma.homepageSection.findFirst({ where: { type: s.type } });
    if (existing) {
      // Only position is re-synced. Titles, visibility, and the Highlights
      // product picker are admin-owned once the row exists.
      await prisma.homepageSection.update({
        where: { id: existing.id },
        data: { position: i },
      });
    } else {
      await prisma.homepageSection.create({
        data: { type: s.type, title: s.title, subtitle: s.subtitle, dataJson: s.dataJson, position: i },
      });
    }
  }
  console.log(`  homepage    ${sections.length} sections`);

  // -- Settings -------------------------------------------------------------
  // The staff directory lives here, not in a component, so it can be trimmed
  // from the admin panel without a code change.
  for (const [key, value] of [
    ["store", company],
    ["services", services],
  ] as const) {
    const valueJson = JSON.stringify(value);
    await prisma.setting.upsert({
      where: { key },
      create: { key, valueJson },
      update: {}, // never overwrite admin edits on re-seed
    });
  }
  console.log(`  settings    store, services`);

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
