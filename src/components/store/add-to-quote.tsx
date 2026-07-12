"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { WishlistButton } from "@/components/store/quick-add";
import { useCart, type CartItem } from "@/stores/cart";

type Item = Omit<CartItem, "quantity">;

export function AddToQuote({ item }: { item: Item }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function onAdd() {
    add(item, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="chamfer-sm flex items-center bg-muted">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Minus size={15} aria-hidden />
          </button>
          <span aria-live="polite" className="w-10 text-center font-mono text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Plus size={15} aria-hidden />
          </button>
        </div>

        <Button onClick={onAdd} className="flex-1">
          {added ? (
            <>
              <Check size={16} aria-hidden /> Added to quote
            </>
          ) : (
            "Add to quote"
          )}
        </Button>
      </div>

      <div className="flex gap-3">
        <WishlistButton item={item} className="flex-1" />
        <Button variant="outline" className="flex-1" onClick={() => router.push("/cart")}>
          View quote list
        </Button>
      </div>
    </div>
  );
}
