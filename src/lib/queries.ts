import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, type ProductSort } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minMinor?: number;
  maxMinor?: number;
  condition?: "NEW" | "REFURBISHED";
  sort?: ProductSort;
  page?: number;
};

const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  model: true,
  priceMinor: true,
  compareAtMinor: true,
  condition: true,
  warranty: true,
  featured: true,
  brand: { select: { slug: true, name: true } },
  category: { select: { slug: true, name: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof PRODUCT_CARD_SELECT }>;

function orderBy(sort: ProductSort | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceMinor: "asc" }];
    case "price-desc":
      return [{ priceMinor: "desc" }];
    case "name-asc":
      return [{ name: "asc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ featured: "desc" }, { position: "asc" }];
  }
}

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };

  if (f.category) where.category = { slug: f.category };
  if (f.brand) where.brand = { slug: f.brand };
  if (f.condition) where.condition = f.condition;

  if (f.minMinor !== undefined || f.maxMinor !== undefined) {
    where.priceMinor = {
      ...(f.minMinor !== undefined ? { gte: f.minMinor } : {}),
      ...(f.maxMinor !== undefined ? { lte: f.maxMinor } : {}),
    };
  }

  if (f.q) {
    // Postgres `contains` compiles to a case-SENSITIVE LIKE, so `mode:
    // "insensitive"` is required for "thinkpad" to match "ThinkPad". Searching
    // name/model/brand covers how people look for hardware: "T14", "lenovo".
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { model: { contains: f.q, mode: "insensitive" } },
      { shortDesc: { contains: f.q, mode: "insensitive" } },
      { brand: { name: { contains: f.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function listProducts(f: ProductFilters) {
  const page = Math.max(1, f.page ?? 1);
  const where = buildWhere(f);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy: orderBy(f.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      specs: { orderBy: { position: "asc" } },
    },
  });
}

export async function getRelatedProducts(product: {
  id: string;
  categoryId: string | null;
  priceMinor: number;
}) {
  if (!product.categoryId) return [];
  return prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    select: PRODUCT_CARD_SELECT,
    orderBy: { priceMinor: "asc" },
    take: 4,
  });
}

/**
 * Fetch products by slug, returned in the order the slugs were given — the
 * admin controls the order of the Highlights row, and a `findMany` will not
 * preserve it. Missing/inactive slugs are silently dropped so a deleted product
 * cannot break the homepage.
 */
export async function getProductsBySlugs(slugs: string[]): Promise<ProductCardData[]> {
  if (!slugs.length) return [];
  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs }, active: true },
    select: PRODUCT_CARD_SELECT,
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.flatMap((s) => {
    const row = bySlug.get(s);
    return row ? [row] : [];
  });
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    select: PRODUCT_CARD_SELECT,
    orderBy: { position: "asc" },
    take,
  });
}

/** Categories that actually have something to show, with live counts. */
export async function listCategories({ onlyFeatured = false } = {}) {
  const rows = await prisma.category.findMany({
    where: onlyFeatured ? { featured: true } : undefined,
    orderBy: { position: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return rows.map((c) => ({ ...c, productCount: c._count.products }));
}

export async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function listBrands({ onlyWithProducts = true } = {}) {
  const rows = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  const mapped = rows.map((b) => ({ ...b, productCount: b._count.products }));
  return onlyWithProducts ? mapped.filter((b) => b.productCount > 0) : mapped;
}

export async function getBrand(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

/** Brand + condition facets, scoped to the current filter minus that facet. */
export async function getFacets(f: ProductFilters) {
  const base = buildWhere({ ...f, brand: undefined });
  const brandGroups = await prisma.product.groupBy({
    by: ["brandId"],
    where: base,
    _count: { _all: true },
  });

  const ids = brandGroups.map((g) => g.brandId).filter((x): x is string => Boolean(x));
  const brandRows = await prisma.brand.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, name: true },
  });
  const byId = new Map(brandRows.map((b) => [b.id, b]));

  const brandFacets = brandGroups
    .flatMap((g) => {
      const b = g.brandId ? byId.get(g.brandId) : undefined;
      return b ? [{ slug: b.slug, name: b.name, count: g._count._all }] : [];
    })
    .sort((a, b) => b.count - a.count);

  const priceRange = await prisma.product.aggregate({
    where: { active: true },
    _min: { priceMinor: true },
    _max: { priceMinor: true },
  });

  return {
    brands: brandFacets,
    minMinor: priceRange._min.priceMinor ?? 0,
    maxMinor: priceRange._max.priceMinor ?? 0,
  };
}

export async function getCounts() {
  const [products, categories, brands, enquiries, newEnquiries] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
  ]);
  return { products, categories, brands, enquiries, newEnquiries };
}
