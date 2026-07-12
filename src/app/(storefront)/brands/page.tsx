import type { Metadata } from "next";
import Link from "next/link";
import { listBrands } from "@/lib/queries";
import { Eyebrow, Panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Multi-brand dealer: HP, Dell, Acer, Lenovo, Asus, MSI, Canon, Epson, Hikvision, APC and more.",
};

export default async function BrandsPage() {
  const brands = await listBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-14 max-w-2xl">
        <Eyebrow>Partners</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Brands</h1>
        <p className="mt-3 text-muted-foreground">
          &ldquo;Leadership in multi-brands and technologies&rdquo; — we are not tied to one vendor,
          so the recommendation is the right machine rather than the one we have to move.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link key={b.id} href={`/brand/${b.slug}`} className="group block">
            <Panel glow className="flex h-full flex-col items-center justify-center gap-2 px-4 py-9">
              <span className="font-display text-lg font-bold tracking-tight group-hover:text-primary">
                {b.name}
              </span>
              <span className="font-mono text-[0.68rem] text-muted-foreground">
                {b.productCount} {b.productCount === 1 ? "product" : "products"}
              </span>
            </Panel>
          </Link>
        ))}
      </div>

      <p className="mt-12 max-w-2xl text-sm text-muted-foreground">
        Brands without a listed product are still supplied to order — security software, networking,
        access control, air conditioning and solar are quoted on enquiry.
      </p>
    </div>
  );
}
