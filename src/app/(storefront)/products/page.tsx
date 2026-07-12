import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { Pagination } from "@/components/store/pagination";
import { EmptyState, ButtonLink, Eyebrow, Skeleton } from "@/components/ui";
import { listProducts, listCategories, getFacets } from "@/lib/queries";
import { parseFilters, hasActiveFilters, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Laptops, gaming machines, desktops, monitors, printers, power backup and more — from a multi-brand dealer serving Kerala since 1998.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [{ items, total, page, pageCount }, categories, facets] = await Promise.all([
    listProducts(filters),
    listCategories(),
    getFacets(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12">
        <Eyebrow>Catalogue</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          All products
        </h1>
        <p className="mt-3 text-muted-foreground">
          {total.toLocaleString("en-IN")} {total === 1 ? "product" : "products"} from{" "}
          {facets.brands.length} brands. Prices are indicative and subject to change.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <CatalogFilters
              categories={categories.filter((c) => c.productCount > 0)}
              brands={facets.brands}
            />
          </Suspense>
        </aside>

        <div>
          {items.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              body={
                hasActiveFilters(filters)
                  ? "Try widening the price range, or clearing a filter. If you know the model you need, ask us directly and we will source it."
                  : "The catalogue is empty. Add products from the admin panel."
              }
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/products" variant="outline">
                    Clear filters
                  </ButtonLink>
                  <ButtonLink href="/contact">Ask us to source it</ButtonLink>
                </div>
              }
            />
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination page={page} pageCount={pageCount} searchParams={sp} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
