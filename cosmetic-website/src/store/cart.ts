import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

export type CartItem = { product: Product; qty: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          const items = existing
            ? state.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
              )
            : [...state.items, { product, qty }];
          return { items, isOpen: true };
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== id),
        })),
      setQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.product.id !== id)
              : state.items.map((i) =>
                  i.product.id === id ? { ...i, qty } : i,
                ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "cosmetic-cart-v2",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.product.price * i.qty, 0);