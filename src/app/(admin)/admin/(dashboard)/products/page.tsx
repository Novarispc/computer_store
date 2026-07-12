import { listAdminProducts } from "@/server/admin/products";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/ui";
import { Pagination } from "@/components/store/pagination";
import { ProductsClient } from "./products-client";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  await requireAdmin();
  const [{ items, total, pageCount }, categories, brands] = await Promise.all([
    listAdminProducts({ q: sp.q, page }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminHeader title="Products" description={`${total} products`} />
      <ProductsClient items={items} categories={categories} brands={brands} />
      <Pagination page={page} pageCount={pageCount} searchParams={sp} basePath="/admin/products" />
    </div>
  );
}
