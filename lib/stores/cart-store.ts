"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  practiceArea: string;
  jurisdictions: string[];
  quantity: number;
  stage?: string;
  stagePrice?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, stage?: string) => void;
  updateQuantity: (id: string, delta: number, stage?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getGST: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          // Create unique key for item (id + stage for multi-stage documents)
          const itemKey = item.stage ? `${item.id}-${item.stage}` : item.id;
          const existing = state.items.find((i) => {
            const existingKey = i.stage ? `${i.id}-${i.stage}` : i.id;
            return existingKey === itemKey;
          });

          if (existing) {
            return {
              items: state.items.map((i) => {
                const iKey = i.stage ? `${i.id}-${i.stage}` : i.id;
                return iKey === itemKey
                  ? { ...i, quantity: i.quantity + quantity }
                  : i;
              }),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (id, stage) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (stage) {
              return !(item.id === id && item.stage === stage);
            }
            return item.id !== id;
          }),
        }));
      },

      updateQuantity: (id, delta, stage) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              const matches = stage
                ? item.id === id && item.stage === stage
                : item.id === id;
              if (matches) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.stagePrice ?? item.price;
          return sum + price * item.quantity;
        }, 0);
      },

      getGST: () => {
        return get().getSubtotal() * 0.1;
      },

      getTotal: () => {
        return get().getSubtotal() * 1.1;
      },
    }),
    {
      name: "hbl-cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
