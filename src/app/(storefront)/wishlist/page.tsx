"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useWishlist } from "@/stores/wishlist";
import { useCart } from "@/stores/cart";
import { formatMinor } from "@/lib/money";
import { ButtonLink, Button, EmptyState, Eyebrow, Panel } from "@/components/ui";

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const hydrated = useWishlist((s) => s.hydrated);
  const remove = useWishlist((s) => s.remove);
  const addToCart = useCart((s) => s.add);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12">
        <Eyebrow>Saved for later</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Wishlist
        </h1>
      </header>

      {!hydrated ? null : items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Tap the heart on any product to keep it here for later."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Panel className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display font-semibold hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 font-mono text-sm">{formatMinor(item.priceMinor)}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    addToCart(item);
                    remove(item.slug);
                  }}
                >
                  Move to quote
                </Button>

                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
