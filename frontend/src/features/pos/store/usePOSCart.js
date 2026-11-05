
import { create } from "zustand";

export const usePOSCart = create((set) => ({
  items: [],

  addItem: (product, variant, quantity = 1) =>
    set((state) => {
      const key = `${product.id}:${variant.id}`;
      const existing = state.items.find(
        (item) => item.key === key
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            key,
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            variantName: variant.name,
            unitPrice: variant.price,
            quantity,
          },
        ],
      };
    }),

  changeQuantity: (key, change) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeItem: (key) =>
    set((state) => ({
      items: state.items.filter((item) => item.key !== key),
    })),

  clearCart: () => set({ items: [] }),
}));
