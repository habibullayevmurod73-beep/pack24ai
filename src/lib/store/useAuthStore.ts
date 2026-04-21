'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

export interface User {
    id: number | string;
    name: string;
    phone: string;
    role: 'user' | 'admin';
    email?: string | null;
    isActive?: boolean;
    createdAt?: string;
    joinedAt?: string;
    // Telegram
    telegramId?: string | null;
    telegramVerifiedAt?: string | null;
    ecoPoints?: number;
    referralCode?: string | null;
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
    register: (name: string, phone: string, password: string, referralCode?: string | null) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setSessionUser: (user: User | null) => void;
    addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
    updateUser: (data: Partial<User>) => void;
}

function normalizePhone(phone: string): string {
    return phone.replace(/\s/g, '');
}

export function sessionUserToStoreUser(
    user: Session['user'] | null | undefined
): User | null {
    if (!user?.id || !user.phone || !user.name) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role === 'admin' ? 'admin' : 'user',
        email: user.email ?? null,
    };
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            orders: [],

            login: async (phone, password) => {
                try {
                    const result = await signIn('credentials', {
                        phone: normalizePhone(phone),
                        password,
                        redirect: false,
                    });

                    if (!result || result.error) {
                        return { success: false, error: "Telefon yoki parol noto'g'ri" };
                    }

                    const session = await getSession();
                    const user = sessionUserToStoreUser(session?.user);
                    if (!user) {
                        return { success: false, error: "Sessiya yaratib bo'lmadi" };
                    }

                    set({ user, isAuthenticated: true });
                    return { success: true };
                } catch {
                    return { success: false, error: "Server bilan bog'lanib bo'lmadi" };
                }
            },

            register: async (name, phone, password, referralCode) => {
                try {
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            phone: normalizePhone(phone),
                            password,
                            referralCode,
                        }),
                    });
                    const data = await res.json();
                    if (!res.ok) return { success: false, error: data.error || "Ro'yxatdan o'tishda xatolik" };

                    const signInResult = await signIn('credentials', {
                        phone: normalizePhone(phone),
                        password,
                        redirect: false,
                    });

                    if (!signInResult || signInResult.error) {
                        return {
                            success: false,
                            error: "Ro'yxatdan o'tildi, lekin avtomatik kirish bajarilmadi",
                        };
                    }

                    const session = await getSession();
                    const user = sessionUserToStoreUser(session?.user);
                    if (!user) {
                        return { success: false, error: "Sessiya yaratib bo'lmadi" };
                    }

                    set({ user, isAuthenticated: true });
                    return { success: true };
                } catch {
                    return { success: false, error: "Server bilan bog'lanib bo'lmadi" };
                }
            },

            logout: () => {
                void signOut({ redirect: false });
                set({ user: null, isAuthenticated: false });
            },

            setSessionUser: (user) => {
                set({ user, isAuthenticated: Boolean(user) });
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
            partialize: (state) => ({ orders: state.orders }),
        }
    )
);
