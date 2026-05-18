import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // array of product IDs
  setItems: (ids: string[]) => void;
  toggleItem: (id: string, isLoggedIn?: boolean) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  fetchWishlist: (isLoggedIn?: boolean) => Promise<void>;
  syncWishlist: (isLoggedIn?: boolean) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (ids) => set({ items: ids }),
      isInWishlist: (id) => get().items.includes(id),
      
      fetchWishlist: async (isLoggedIn = false) => {
        if (!isLoggedIn) return; // For guests, rely on persisted local storage
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

      toggleItem: async (id, isLoggedIn = false) => {
        const { items } = get();
        const exists = items.includes(id);
        
        // Optimistic Update for instant UI response (persisted automatically)
        if (exists) {
          set({ items: items.filter(i => i !== id) });
        } else {
          set({ items: [...items, id] });
        }

        // Only sync to Supabase database if logged in
        if (isLoggedIn) {
          try {
            const res = await fetch('/api/wishlist', {
              method: exists ? 'DELETE' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: id })
            });
            
            if (!res.ok) {
              // Rollback if DB sync fails
              set({ items });
            }
          } catch (err) {
            set({ items });
            console.error("Wishlist sync failed:", err);
          }
        }
      },

      syncWishlist: async (isLoggedIn = false) => {
        if (!isLoggedIn) return;
        try {
          // 1. Fetch current wishlist from DB
          const res = await fetch('/api/wishlist');
          if (!res.ok) return;
          const dbData = await res.json();
          const dbProductIds = dbData.map((item: any) => item.product_id);
          
          // 2. Identify local items not in DB yet
          const { items: localItems } = get();
          const itemsToSync = localItems.filter(id => !dbProductIds.includes(id));
          
          // 3. Post missing items to DB
          for (const productId of itemsToSync) {
            await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId })
            });
          }
          
          // 4. Update state with merged list
          const merged = Array.from(new Set([...dbProductIds, ...localItems]));
          set({ items: merged });
        } catch (err) {
          console.error("Failed to sync wishlist with DB:", err);
        }
      }
    }),
    { name: 'wishlist-storage' }
  )
);

