"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistItem = {
  slug: string;
  name: string;
  model: string | null;
  priceMinor: number;
};

type WishlistState = {
  items: WishlistItem[];
  hydrated: boolean;
  toggle: (item: WishlistItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      toggle: (item) =>
        set((s) =>
          s.items.some((i) => i.slug === item.slug)
            ? { items: s.items.filter((i) => i.slug !== item.slug) }
            : { items: [...s.items, item] }
        ),

      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "esq-wishlist",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
