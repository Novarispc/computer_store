"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductIllustration } from "@/components/store/product-image";

export type GalleryImage = { src: string; alt: string };

/**
 * When a product has uploaded photos we show a thumbnail strip. When it has
 * none we render the drawn illustration, which is theme-aware and so must be an
 * inline <svg> rather than an <img>.
 */
export function ProductGallery({
  images,
  slug,
  categorySlug,
}: {
  images: GalleryImage[];
  slug: string;
  categorySlug?: string | null;
}) {
  const [active, setActive] = useState(0);
  const generated = images.length === 0;
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="chamfer-frame chamfer glow-edge">
        <div className="chamfer relative aspect-[4/3] overflow-hidden bg-surface">
          {generated ? (
            <ProductIllustration slug={slug} categorySlug={categorySlug} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.src} alt={current.alt} className="h-full w-full object-contain" />
          )}
          {generated ? (
            <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Illustration — photo on request
            </span>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "chamfer-sm size-16 overflow-hidden bg-surface ring-1 ring-inset transition-all",
                i === active ? "ring-primary" : "ring-border hover:ring-muted-foreground"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
