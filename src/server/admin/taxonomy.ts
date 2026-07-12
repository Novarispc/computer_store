"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: true } | { ok: false; error: string };

const CategoryInput = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

export async function listAdminCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(input: z.infer<typeof CategoryInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = CategoryInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  const max = await prisma.category.aggregate({ _max: { position: true } });
  await prisma.category.create({
    data: {
      slug: slugify(d.name),
      name: d.name,
      description: d.description || null,
      icon: d.icon || null,
      featured: d.featured,
      position: (max._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { ok: true };
}

export async function updateCategory(id: string, input: z.infer<typeof CategoryInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = CategoryInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  await prisma.category.update({
    where: { id },
    data: {
      name: d.name,
      description: d.description || null,
      icon: d.icon || null,
      featured: d.featured,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { ok: true };
}

const BrandInput = z.object({
  name: z.string().trim().min(1).max(60),
  featured: z.boolean().default(false),
});

export async function listAdminBrands() {
  await requireAdmin();
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createBrand(input: z.infer<typeof BrandInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = BrandInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  await prisma.brand.create({ data: { slug: slugify(d.name), name: d.name, featured: d.featured } });
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return { ok: true };
}

export async function updateBrand(id: string, input: z.infer<typeof BrandInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = BrandInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const d = parsed.data;

  await prisma.brand.update({ where: { id }, data: { name: d.name, featured: d.featured } });
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return { ok: true };
}
