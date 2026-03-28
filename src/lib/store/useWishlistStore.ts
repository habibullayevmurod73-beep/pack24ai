import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
    productId: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    addedAt: number;
}

interface WishlistState {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (item: WishlistItem) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (item) =>
                set((state) => {
                    if (state.items.some((i) => i.productId === item.productId)) return state;
                    return { items: [...state.items, { ...item, addedAt: Date.now() }] };
                }),

            removeFromWishlist: (productId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                })),

            toggleWishlist: (item) => {
                const { isInWishlist, addToWishlist, removeFromWishlist } = get();
                if (isInWishlist(item.productId)) {
                    removeFromWishlist(item.productId);
                } else {
                    addToWishlist(item);
                }
            },

            isInWishlist: (productId) =>
                get().items.some((i) => i.productId === productId),

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'pack24-wishlist',
        }
    )
);
