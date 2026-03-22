import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalAmount: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (newItem) => set((state) => {
                const existingItem = state.items.find(i => i.productId === newItem.productId);
                if (existingItem) {
                    return {
                        items: state.items.map(i =>
                            i.productId === newItem.productId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        )
                    };
                }
                return { items: [...state.items, newItem] };
            }),
            removeFromCart: (id) => set((state) => ({
                items: state.items.filter(i => i.productId !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(i =>
                    i.productId === id ? { ...i, quantity } : i
                )
            })),
            clearCart: () => set({ items: [] }),
            totalAmount: () => {
                const state = get();
                return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            },
            getTotalItems: () => {
                const state = get();
                return state.items.reduce((sum, item) => sum + item.quantity, 0);
            }
        }),
        {
            name: 'pack24-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
