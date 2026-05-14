import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // array of product IDs
  setItems: (ids: string[]) => void;
  toggleItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (ids) => set({ items: ids }),
      isInWishlist: (id) => get().items.includes(id),
      
      fetchWishlist: async () => {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            set({ items: data.map((item: any) => item.product_id) });
          }
        } catch (err) {
          console.error("Failed to fetch wishlist:", err);
        }
      },

      toggleItem: async (id) => {
        const { items } = get();
        const exists = items.includes(id);
        
        // Optimistic Update for instant UI response
        if (exists) {
          set({ items: items.filter(i => i !== id) });
        } else {
          set({ items: [...items, id] });
        }

        try {
          const res = await fetch('/api/wishlist', {
            method: exists ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id })
          });
          
          if (!res.ok) {
            // Rollback if not authorized or error
            set({ items });
          }
        } catch (err) {
          set({ items });
          console.error("Wishlist sync failed:", err);
        }
      },
    }),
    { name: 'wishlist-storage' }
  )
);
