"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { rupeesToMinor } from "@/lib/money";
import { PRODUCT_CONDITIONS } from "@/lib/constants";
import { isOwnUploadUrl } from "@/lib/uploads";

const ProductInput = z.object({
  name: z.string().trim().min(2).max(160),
  model: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  /** A brand typed by hand rather than picked from the list. Takes priority over brandId when set. */
  brandName: z.string().trim().max(60).optional(),
  priceRupees: z.number().positive(),
  compareAtRupees: z.number().positive().optional(),
  condition: z.enum(PRODUCT_CONDITIONS),
  warranty: z.string().trim().max(60).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  specs: z.array(z.object({ key: z.string().min(1).max(40), value: z.string().min(1).max(120) })),
  /**
   * URL returned by /api/admin/upload — a local upload path or a Vercel Blob
   * URL, never an arbitrary link (which would let an admin form embed a remote
   * image). `null` clears the image and restores the generated illustration.
   */
  imageUrl: z
    .string()
    .refine(isOwnUploadUrl, "Upload the image rather than pasting a link.")
    .nullable()
    .optional(),
});

/** Product images are fully derived from the form, so replace rather than merge. */
async function syncImage(productId: string, name: string, imageUrl: string | null | undefined) {
  if (imageUrl === undefined) return;
  await prisma.productImage.deleteMany({ where: { productId } });
  if (imageUrl) {
    await prisma.productImage.create({ data: { productId, url: imageUrl, alt: name, position: 0 } });
  }
}

export type ProductFormInput = z.infer<typeof ProductInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "product";
  let slug = root;
  let n = 2;
  // Small catalogue; a loop is simpler and clear enough than a single query.
  while (
    await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  const slug = await uniqueSlug(`${d.name}`);
  const brandId = d.brandName ? await resolveBrandId(d.brandName) : d.brandId || null;

  const product = await prisma.product.create({
    data: {
      slug,
      name: d.name,
      model: d.model || null,
      description: d.description || "",
      shortDesc: d.description ? d.description.slice(0, 180) : null,
      categoryId: d.categoryId || null,
      brandId,
      priceMinor: rupeesToMinor(d.priceRupees),
      compareAtMinor: d.compareAtRupees ? rupeesToMinor(d.compareAtRupees) : null,
      condition: d.condition,
      warranty: d.warranty || null,
      featured: d.featured,
      active: d.active,
      specs: { create: d.specs.map((s, i) => ({ ...s, position: i })) },
    },
  });

  await syncImage(product.id, d.name, d.imageUrl);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true, name: true } });
  if (!existing) return { ok: false, error: "Product not found." };

  const slug = d.name === existing.name ? existing.slug : await uniqueSlug(d.name, id);
  const brandId = d.brandName ? await resolveBrandId(d.brandName) : d.brandId || null;

  await prisma.$transaction([
    prisma.productSpec.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        slug,
        name: d.name,
        model: d.model || null,
        description: d.description || "",
        shortDesc: d.description ? d.description.slice(0, 180) : null,
        categoryId: d.categoryId || null,
        brandId,
        priceMinor: rupeesToMinor(d.priceRupees),
        compareAtMinor: d.compareAtRupees ? rupeesToMinor(d.compareAtRupees) : null,
        condition: d.condition,
        warranty: d.warranty || null,
        featured: d.featured,
        active: d.active,
        specs: { create: d.specs.map((s, i) => ({ ...s, position: i })) },
      },
    }),
  ]);

  await syncImage(id, d.name, d.imageUrl);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${slug}`);
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function listAdminProducts(params: { q?: string; page?: number } = {}) {
  await requireAdmin();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = 30;

  const where = params.q
    ? {
        OR: [
          { name: { contains: params.q, mode: "insensitive" as const } },
          { model: { contains: params.q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, images: { take: 1 } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  return prisma.product.findUnique({
    where: { id },
    include: { specs: { orderBy: { position: "asc" } }, images: true },
  });
}

/* ------------------------------------------------------------ Bulk import */

const TRUE_ISH = new Set(["true", "yes", "y", "1"]);

/** CSV cells are always strings; coerce loosely rather than rejecting "Yes"/"1". */
function parseBool(raw: string | undefined, fallback: boolean): boolean {
  const v = raw?.trim().toLowerCase();
  if (!v) return fallback;
  return TRUE_ISH.has(v);
}

function parseCondition(raw: string | undefined): "NEW" | "REFURBISHED" {
  return raw?.trim().toUpperCase() === "REFURBISHED" ? "REFURBISHED" : "NEW";
}

/** "RAM:8GB|Storage:512GB SSD" -> [{key,value}]. Silently skips malformed pairs. */
function parseSpecs(raw: string | undefined): { key: string; value: string }[] {
  if (!raw) return [];
  return raw
    .split("|")
    .map((pair) => {
      const idx = pair.indexOf(":");
      if (idx < 0) return null;
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      return key && value ? { key: key.slice(0, 40), value: value.slice(0, 120) } : null;
    })
    .filter((s): s is { key: string; value: string } => s !== null);
}

const BulkRow = z.object({
  name: z.string().trim().min(2, "Name is required").max(160),
  model: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(60).optional(),
  price: z
    .string()
    .trim()
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, "Price must be a positive number"),
  compareat: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) > 0), "Compare-at price must be a positive number"),
  condition: z.string().trim().optional(),
  warranty: z.string().trim().max(60).optional(),
  featured: z.string().trim().optional(),
  active: z.string().trim().optional(),
  description: z.string().trim().max(4000).optional(),
  specs: z.string().trim().optional(),
});

export type BulkRowResult = { row: number; name: string; ok: boolean; error?: string };

/** Case-insensitive find-or-create, since a spreadsheet author won't know IDs. */
async function resolveCategoryId(name: string | undefined): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const existing = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const max = await prisma.category.aggregate({ _max: { position: true } });
  const created = await prisma.category.create({
    data: { slug: slugify(trimmed), name: trimmed, position: (max._max.position ?? 0) + 1 },
  });
  return created.id;
}

async function resolveBrandId(name: string | undefined): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const created = await prisma.brand.create({ data: { slug: slugify(trimmed), name: trimmed } });
  return created.id;
}

/**
 * Always creates — a bulk import is for bringing in a batch of new listings,
 * not for reconciling against the existing catalogue. Editing an existing
 * product stays a deliberate, one-at-a-time action in the product form, so a
 * mistyped spreadsheet can never silently overwrite real data.
 *
 * Every row is independent: a bad row is skipped and reported, the rest still
 * import. Category/brand names are resolved case-insensitively and created if
 * they don't already exist yet, the same latitude the admin form itself gives
 * category/brand selection.
 */
export async function bulkImportProducts(
  rawRows: Record<string, string>[]
): Promise<{ results: BulkRowResult[]; created: number }> {
  await requireAdmin();

  const results: BulkRowResult[] = [];
  let created = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2; // header is row 1
    const raw = rawRows[i];
    const displayName = raw.name?.trim() || `(row ${rowNum})`;

    const parsed = BulkRow.safeParse(raw);
    if (!parsed.success) {
      results.push({
        row: rowNum,
        name: displayName,
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid row",
      });
      continue;
    }
    const d = parsed.data;

    try {
      const [categoryId, brandId] = await Promise.all([
        resolveCategoryId(d.category),
        resolveBrandId(d.brand),
      ]);

      const slug = await uniqueSlug(d.name);
      const specs = parseSpecs(d.specs);

      await prisma.product.create({
        data: {
          slug,
          name: d.name,
          model: d.model || null,
          description: d.description || "",
          shortDesc: d.description ? d.description.slice(0, 180) : null,
          categoryId,
          brandId,
          priceMinor: rupeesToMinor(Number(d.price)),
          compareAtMinor: d.compareat ? rupeesToMinor(Number(d.compareat)) : null,
          condition: parseCondition(d.condition),
          warranty: d.warranty || null,
          featured: parseBool(d.featured, false),
          active: parseBool(d.active, true),
          specs: { create: specs.map((s, j) => ({ ...s, position: j })) },
        },
      });

      created++;
      results.push({ row: rowNum, name: d.name, ok: true });
    } catch {
      results.push({ row: rowNum, name: displayName, ok: false, error: "Could not save this row." });
    }
  }

  if (created > 0) {
    revalidatePath("/admin/products");
    revalidatePath("/products");
  }

  return { results, created };
}
