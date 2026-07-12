import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, listProducts, listCategories, getFacets } from "@/lib/queries";
import { parseFilters, type RawSearchParams } from "@/lib/search-params";
import { ProductGrid } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { Pagination } from "@/components/store/pagination";
import { ButtonLink, EmptyState, Eyebrow } from "@/components/ui";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name, description: category.description ?? undefined };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const filters = { ...parseFilters(sp), category: slug };
  const basePath = `/category/${slug}`;

  const [{ items, total, page, pageCount }, categories, facets] = await Promise.all([
    listProducts(filters),
    listCategories(),
    getFacets(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <Eyebrow>Category</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        ) : null}
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CatalogFilters
            categories={categories.filter((c) => c.productCount > 0)}
            brands={facets.brands}
            basePath={basePath}
            lockedCategory={slug}
          />
        </aside>

        <div>
          {items.length === 0 ? (
            <EmptyState
              title={`No ${category.name.toLowerCase()} match those filters`}
              body="We stock more than the price list shows. Tell us the model you need and we will source it."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href={basePath} variant="outline">
                    Clear filters
                  </ButtonLink>
                  <ButtonLink href="/contact">Ask us to source it</ButtonLink>
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
