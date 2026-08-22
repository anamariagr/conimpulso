import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mirrors the wholesale rule on the product page: once quantity meets the minimum,
// the wholesale price applies to the whole quantity (not just the units above it).
export const unitPriceFor = (item) => {
  const minWholesale = item.minimum_wholesale_quantity || 5;
  if (item.price_wholesale && item.quantity >= minWholesale) {
    return item.price_wholesale;
  }
  return item.price;
};

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
                price_wholesale: product.price_wholesale ? parseFloat(product.price_wholesale) : null,
                minimum_wholesale_quantity: product.minimum_wholesale_quantity || 5,
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

      totalPrice: () => get().items.reduce((s, i) => s + unitPriceFor(i) * i.quantity, 0),
    }),
    { name: 'conimpulso-cart' }
  )
);
