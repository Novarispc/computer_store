"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart, cartTotalMinor } from "@/stores/cart";
import { formatMinor } from "@/lib/money";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import { ButtonLink, EmptyState, Eyebrow, Panel } from "@/components/ui";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const total = cartTotalMinor(items);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12">
        <Eyebrow>Before checkout</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Your quote list
        </h1>
        <p className="mt-3 text-muted-foreground">
          This is not an order. Submitting sends the list to Esquire, who confirm final pricing
          and availability before anything ships.
        </p>
      </header>

      {!hydrated ? null : items.length === 0 ? (
        <EmptyState
          title="Your quote list is empty"
          body="Add a few products and come back — the list is saved on this device."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
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
                    {item.model ? (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        Model {item.model}
                      </p>
                    ) : null}
                  </div>

                  <div className="chamfer-sm flex items-center bg-muted">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.slug, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus size={14} aria-hidden />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.slug, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={14} aria-hidden />
                    </button>
                  </div>

                  <p className="w-28 text-right font-mono text-sm font-semibold">
                    {formatMinor(item.priceMinor * item.quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    aria-label={`Remove ${item.name} from quote list`}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </Panel>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Panel glow className="p-6">
              <Eyebrow className="mb-4">Estimated total</Eyebrow>
              <p className="font-mono text-3xl font-bold">{formatMinor(total)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{PRICE_DISCLAIMER}.</p>
              <ButtonLink href="/checkout" className="mt-6 w-full">
                Request a quote <ArrowRight size={15} aria-hidden />
              </ButtonLink>
            </Panel>
          </aside>
        </div>
      )}
    </div>
  );
}
