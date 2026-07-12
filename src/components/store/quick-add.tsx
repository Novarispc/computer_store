"use client";

import { useState } from "react";
import { Check, Plus, Heart } from "lucide-react";
import { useCart, type CartItem } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

type Item = Omit<CartItem, "quantity">;

export function QuickAdd({ item }: { item: Item }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function onAdd() {
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${item.name} to quote`}
      className={cn(
        "chamfer-sm inline-flex size-10 shrink-0 items-center justify-center transition-all duration-200",
        added
          ? "bg-success text-white"
          : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
      )}
    >
      {added ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
    </button>
  );
}

export function WishlistButton({ item, className }: { item: Item; className?: string }) {
  const toggle = useWishlist((s) => s.toggle);
  const items = useWishlist((s) => s.items);
  const hydrated = useWishlist((s) => s.hydrated);

  // Before rehydration the client cannot know the saved state; render the
  // neutral outline so SSR and first client paint agree.
  const saved = hydrated && items.some((i) => i.slug === item.slug);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      className={cn(
        "chamfer-sm inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ring-1 ring-inset transition-colors",
        saved
          ? "bg-primary/10 text-primary ring-primary/40"
          : "text-muted-foreground ring-border hover:text-foreground",
        className
      )}
    >
      <Heart size={16} aria-hidden fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
