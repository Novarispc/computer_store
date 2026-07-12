import Link from "next/link";
import { Chip, Price } from "@/components/ui";
import { ProductImage, hasUploadedImage } from "@/components/store/product-image";
import type { ProductCardData } from "@/lib/queries";
import { QuickAdd } from "@/components/store/quick-add";

export function ProductCard({ product }: { product: ProductCardData }) {
  const generated = !hasUploadedImage(product);

  return (
    <article className="chamfer-frame chamfer glow-edge group h-full">
      <div className="chamfer specular relative flex h-full flex-col overflow-hidden bg-card">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[4/3] overflow-hidden bg-surface"
        >
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]">
            <ProductImage product={product} />
          </div>
          {generated ? (
            <span className="pointer-events-none absolute bottom-2 right-2 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground/70">
              Illustration
            </span>
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            {product.brand ? (
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-primary">
                {product.brand.name}
              </span>
            ) : null}
            {product.condition === "REFURBISHED" ? <Chip>Refurbished</Chip> : null}
          </div>

          <h3 className="font-display text-base font-semibold leading-snug">
            <Link href={`/product/${product.slug}`} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>

          {product.warranty ? (
            <p className="text-xs text-muted-foreground">{product.warranty} warranty</p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <Price minor={product.priceMinor} size="md" />
            <QuickAdd
              item={{
                slug: product.slug,
                name: product.name,
                model: product.model,
                priceMinor: product.priceMinor,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
