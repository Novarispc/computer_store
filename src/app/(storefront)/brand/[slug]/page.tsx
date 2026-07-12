import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand, listProducts, listCategories, getFacets } from "@/lib/queries";
import { parseFilters, type RawSearchParams } from "@/lib/search-params";
import { ProductGrid } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { Pagination } from "@/components/store/pagination";
import { ButtonLink, EmptyState, Eyebrow } from "@/components/ui";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: brand.name,
    description: `${brand.name} hardware supplied and serviced by Esquire Computers, Thrissur.`,
  };
}

export default async function BrandPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;

  const brand = await getBrand(slug);
  if (!brand) notFound();

  const filters = { ...parseFilters(sp), brand: slug };
  const basePath = `/brand/${slug}`;

  const [{ items, total, page, pageCount }, categories, facets] = await Promise.all([
    listProducts(filters),
    listCategories(),
    getFacets(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <Eyebrow>Brand</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {brand.name}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {total} {total === 1 ? "product" : "products"} listed
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CatalogFilters
            categories={categories.filter((c) => c.productCount > 0)}
            brands={facets.brands}
            basePath={basePath}
            lockedBrand={slug}
          />
        </aside>

        <div>
          {items.length === 0 ? (
            <EmptyState
              title={`No ${brand.name} products match those filters`}
              body={`We supply the full ${brand.name} range to order. Send us the model and we will quote it.`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href={basePath} variant="outline">
                    Clear filters
                  </ButtonLink>
                  <ButtonLink href="/contact">Request a quote</ButtonLink>
                </div>
              }
            />
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination page={page} pageCount={pageCount} searchParams={sp} basePath={basePath} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
