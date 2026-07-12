import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProduct, getRelatedProducts } from "@/lib/queries";
import { formatMinor } from "@/lib/money";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import { Chip, Eyebrow, Panel, SectionHeading } from "@/components/ui";
import { ProductGallery, type GalleryImage } from "@/components/store/product-gallery";
import { AddToQuote } from "@/components/store/add-to-quote";
import { ProductGrid } from "@/components/store/product-card";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.shortDesc ??
      `${product.name} — available from Esquire Computers, Thrissur. Request a quote.`,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const images: GalleryImage[] = product.images.map((i) => ({
    src: i.url,
    alt: i.alt ?? product.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-10">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
          </li>
          {product.category ? (
            <>
              <ChevronRight size={13} aria-hidden />
              <li>
                <Link href={`/category/${product.category.slug}`} className="hover:text-primary">
                  {product.category.name}
                </Link>
              </li>
            </>
          ) : null}
          <ChevronRight size={13} aria-hidden />
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-14 lg:grid-cols-2">
        <ProductGallery
          images={images}
          slug={product.slug}
          categorySlug={product.category?.slug}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? (
              <Link
                href={`/brand/${product.brand.slug}`}
                className="font-mono text-xs uppercase tracking-[0.25em] text-primary hover:underline"
              >
                {product.brand.name}
              </Link>
            ) : null}
            {product.condition === "REFURBISHED" ? <Chip>Refurbished</Chip> : null}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          {product.model ? (
            <p className="mt-2 font-mono text-sm text-muted-foreground">Model {product.model}</p>
          ) : null}

          <div className="mt-8">
            <p className="font-mono text-4xl font-bold tracking-tight">
              {formatMinor(product.priceMinor)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {PRICE_DISCLAIMER}. Final pricing is confirmed on your quote.
            </p>
          </div>

          {product.warranty ? (
            <p className="mt-6 text-sm">
              <span className="text-muted-foreground">Warranty</span>{" "}
              <span className="font-medium">{product.warranty}</span>
            </p>
          ) : null}

          <div className="mt-10">
            <AddToQuote
              item={{
                slug: product.slug,
                name: product.name,
                model: product.model,
                priceMinor: product.priceMinor,
              }}
            />
          </div>

          {product.specs.length > 0 ? (
            <div className="mt-12">
              <Eyebrow className="mb-4">Specification</Eyebrow>
              <Panel>
                <dl className="divide-y divide-border">
                  {product.specs.map((spec) => (
                    <div key={spec.id} className="grid grid-cols-3 gap-4 px-5 py-3.5">
                      <dt className="text-sm text-muted-foreground">{spec.key}</dt>
                      <dd className="col-span-2 font-mono text-sm">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
              <p className="mt-3 text-xs text-muted-foreground">
                Specifications are transcribed from the manufacturer price list. Confirm exact
                configuration before ordering.
              </p>
            </div>
          ) : null}

          {product.shortDesc ? (
            <div className="mt-10">
              <Eyebrow className="mb-3">As listed</Eyebrow>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.shortDesc}</p>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-28">
          <SectionHeading
            eyebrow="Also in this category"
            title={`More ${product.category?.name.toLowerCase() ?? "products"}`}
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
