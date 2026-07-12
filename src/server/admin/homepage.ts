"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { HIGHLIGHTS_SECTION_TYPE } from "@/lib/constants";

export type ActionResult = { ok: true } | { ok: false; error: string };

const SectionInput = z.object({
  title: z.string().trim().max(160).optional().or(z.literal("")),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export async function listHomepageSections() {
  await requireAdmin();
  return prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
}

export async function updateHomepageSection(
  id: string,
  input: z.infer<typeof SectionInput>
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = SectionInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  await prisma.homepageSection.update({
    where: { id },
    data: { title: d.title || null, subtitle: d.subtitle || null, active: d.active },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true };
}

/* ------------------------------------------------------------- Highlights */

const HighlightsInput = z.object({
  title: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  active: z.boolean(),
  slugs: z.array(z.string().min(1)).max(12),
});

/** Products an admin can choose from, newest first, optionally filtered. */
export async function searchProductsForHighlights(q: string) {
  await requireAdmin();
  return prisma.product.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { model: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      slug: true,
      name: true,
      priceMinor: true,
      brand: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: 40,
  });
}

export async function getHighlightsForAdmin() {
  await requireAdmin();
  const row = await prisma.homepageSection.findFirst({
    where: { type: HIGHLIGHTS_SECTION_TYPE },
  });
  if (!row) return null;

  let slugs: string[] = [];
  try {
    const parsed = JSON.parse(row.dataJson ?? "{}") as { slugs?: string[] };
    slugs = Array.isArray(parsed.slugs) ? parsed.slugs : [];
  } catch {
    slugs = [];
  }

  // Resolve to names so the admin sees what is actually selected, and so a
  // slug pointing at a deleted product is dropped rather than shown as a ghost.
  const products = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true, brand: { select: { name: true } } },
      })
    : [];
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return {
    id: row.id,
    title: row.title ?? "Highlights",
    subtitle: row.subtitle ?? "",
    active: row.active,
    selected: slugs.flatMap((s) => {
      const p = bySlug.get(s);
      return p ? [{ slug: p.slug, name: p.name, brand: p.brand?.name ?? null }] : [];
    }),
  };
}

export async function updateHighlights(input: z.infer<typeof HighlightsInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = HighlightsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Add a title and up to 12 products." };
  const d = parsed.data;

  const existing = await prisma.homepageSection.findFirst({
    where: { type: HIGHLIGHTS_SECTION_TYPE },
  });

  const data = {
    type: HIGHLIGHTS_SECTION_TYPE,
    title: d.title,
    subtitle: d.subtitle || null,
    active: d.active,
    dataJson: JSON.stringify({ slugs: d.slugs }),
  };

  if (existing) {
    await prisma.homepageSection.update({ where: { id: existing.id }, data });
  } else {
    await prisma.homepageSection.create({ data: { ...data, position: 1 } });
  }

  revalidatePath("/");
  revalidatePath("/admin/highlights");
  return { ok: true };
}
