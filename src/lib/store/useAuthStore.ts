import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: number | string;
    name: string;
    phone: string;
    role: 'user' | 'admin';
    isActive?: boolean;
    createdAt?: string;
    joinedAt?: string; // legacy support
}

export interface OrderItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    date: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'cash' | 'card' | 'transfer';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    orders: Order[];

    login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
    updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            orders: [],

            login: async (phone, password) => {
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone, password }),
                    });
                    const data = await res.json();
                    if (!res.ok) return { success: false, error: data.error || "Kirishda xatolik" };
                    set({ user: data.user, isAuthenticated: true });
                    return { success: true };
                } catch {
                    return { success: false, error: "Server bilan bog'lanib bo'lmadi" };
                }
            },

            register: async (name, phone, password) => {
                try {
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, password }),
                    });
                    const data = await res.json();
                    if (!res.ok) return { success: false, error: data.error || "Ro'yxatdan o'tishda xatolik" };
                    set({ user: data.user, isAuthenticated: true });
                    return { success: true };
                } catch {
                    return { success: false, error: "Server bilan bog'lanib bo'lmadi" };
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            addOrder: (orderData) => {
                const newOrder: Order = {
                    ...orderData,
                    id: 'ORD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                    date: new Date().toISOString(),
                };
                set((state) => ({ orders: [newOrder, ...state.orders] }));
            },

            updateUser: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                }));
            },
        }),
        {
            name: 'pack24-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
