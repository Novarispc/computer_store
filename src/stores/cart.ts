"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * A quote basket, not a shopping cart: there is no payment, and the price is
 * indicative until Esquire confirms it. Items snapshot name/model/price so a
 * basket survives the product being edited or removed.
 */
export type CartItem = {
  slug: string;
  name: string;
  model: string | null;
  priceMinor: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.slug === item.slug ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity }] };
        }),

      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.slug !== slug)
              : s.items.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "esq-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Guards every consumer against rendering server-empty vs client-full.
        if (state) state.hydrated = true;
      },
    }
  )
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartTotalMinor = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.priceMinor * i.quantity, 0);
