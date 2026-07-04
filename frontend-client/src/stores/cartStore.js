import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product_id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                slug: product.slug,
                name: product.name,
                price: parseFloat(product.price) || 0,
                image: Array.isArray(product.images) ? product.images[0] : product.image || null,
                shop_name: product.shop?.name || '',
                quantity,
              },
            ],
          });
        }
      },

      removeItem: (product_id) =>
        set({ items: get().items.filter((i) => i.product_id !== product_id) }),

      updateQty: (product_id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.product_id === product_id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'conimpulso-cart' }
  )
);
