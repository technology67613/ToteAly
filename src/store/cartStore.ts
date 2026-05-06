import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique string (e.g. timestamp or product id)
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  isCustomized: boolean;
  customizationDetails?: any; // e.g. Fabric JS canvas JSON or snapshot
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          // If it's a non-customized product and already in cart, just increase quantity
          if (!item.isCustomized) {
            const existingItem = state.items.find((i) => i.productId === item.productId && !i.isCustomized);
            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
                ),
              };
            }
          }
          // Otherwise add as new line item
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'tote-ally-cart',
    }
  )
);
