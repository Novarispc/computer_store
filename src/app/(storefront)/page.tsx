import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { getStore, getServices } from "@/lib/settings";
import { getHighlightsSection } from "@/lib/homepage";
import {
  listCategories,
  listBrands,
  getFeaturedProducts,
  getProductsBySlugs,
} from "@/lib/queries";
import { HeroFallback, HomeCta } from "@/components/store/hero-fallback";
import { ProductGrid } from "@/components/store/product-card";
import { Eyebrow, Panel, SectionHeading } from "@/components/ui";

function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Box;
  return <Icon size={20} className="text-primary" aria-hidden />;
}

function ServiceIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Wrench;
  return <Icon size={20} className="text-primary" aria-hidden />;
}

export default async function HomePage() {
  const [store, services, categories, brands, featured, highlights] = await Promise.all([
    getStore(),
    getServices(),
    listCategories({ onlyFeatured: true }),
    listBrands(),
    getFeaturedProducts(8),
    getHighlightsSection(),
  ]);

  // Admin-picked row. Rendered only when the section is on and resolves to at
  // least one live product, so a deleted product cannot leave an empty band.
  const highlightProducts =
    highlights?.active && highlights.slugs.length
      ? await getProductsBySlugs(highlights.slugs)
      : [];

  return (
    <>
      <HeroFallback
        title={store.tagline}
        subtitle="Laptops, gaming rigs, workstations, monitors, printers, CCTV and power backup — one multi-brand dealer, twenty-plus engineers, all of Kerala."
      />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {highlightProducts.length > 0 && highlights ? (
          <section className="mb-28">
            <SectionHeading
              eyebrow="Hand-picked"
              title={highlights.title}
              subtitle={highlights.subtitle}
              action={
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  All products <ArrowRight size={14} aria-hidden />
                </Link>
              }
            />
            <ProductGrid products={highlightProducts} />
          </section>
        ) : null}

        <section>
          <SectionHeading
            eyebrow="Shop by category"
            title="Twenty-one categories, one supplier"
            subtitle="From the laptop on the desk to the camera above the door."
            action={
              <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                All categories <ArrowRight size={14} aria-hidden />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group block">
                <Panel glow className="p-6">
                  <CategoryIcon name={c.icon} />
                  <h3 className="mt-4 font-display text-base font-semibold group-hover:text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-1 font-mono text-[0.68rem] text-muted-foreground">
                    {c.productCount} listed
                  </p>
                </Panel>
              </Link>
            ))}
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mt-28">
            <SectionHeading
              eyebrow="Picked from this month's list"
              title="Featured hardware"
              action={
                <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  All products <ArrowRight size={14} aria-hidden />
                </Link>
              }
            />
            <ProductGrid products={featured} />
          </section>
        ) : null}

        <section className="mt-28">
          <SectionHeading eyebrow="Multi-brand" title="Brands we carry" />
          <div className="flex flex-wrap gap-3">
            {brands.slice(0, 16).map((b) => (
              <Link
                key={b.id}
                href={`/brand/${b.slug}`}
                className="chamfer-sm bg-muted px-4 py-2 font-display text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <SectionHeading
            eyebrow="Service, not just sales"
            title="Twenty engineers behind every invoice"
            subtitle={`${store.certification} certified. ${store.hours}.`}
            action={
              <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                All services <ArrowRight size={14} aria-hidden />
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((s) => (
              <Panel key={s.slug} className="p-6">
                <ServiceIcon name={s.icon} />
                <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <div className="chamfer-frame chamfer">
            <div className="chamfer grid grid-cols-2 gap-6 bg-card px-8 py-10 sm:grid-cols-4">
              {store.trust.map((t) => (
                <div key={t.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-primary sm:text-3xl">
                    {t.value}
                  </p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-28">
          <HomeCta />
        </section>
      </div>
    </>
  );
}
