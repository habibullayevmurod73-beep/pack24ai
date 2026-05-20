/**
 * Session Store Unit Tests
 * Lib: src/lib/telegram/sessionStore.ts
 */
import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock Prisma for DB persistence
jest.mock('@/lib/prisma', () => ({
    prisma: {
        telegramConfig: {
            upsert: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
        },
    },
}));

import { createTelegramSessionStore } from '@/lib/telegram/sessionStore';

describe('TelegramSessionStore', () => {
    let store: ReturnType<typeof createTelegramSessionStore<{ step: string; data: Record<string, unknown> }>>;

    beforeEach(() => {
        store = createTelegramSessionStore<{ step: string; data: Record<string, unknown> }>(
            'test_namespace',
            { ttlMs: 60000 }
        );
        store.clear();
    });

    describe('set va get', () => {
        it('qiymat saqlash va olish', () => {
            store.set('user_123', { step: 'greeting', data: {} });
            const result = store.get('user_123');

            expect(result).toBeDefined();
            expect(result?.step).toBe('greeting');
        });

        it('mavjud bo\'lmagan kalit — undefined qaytaradi', () => {
            const result = store.get('nonexistent_key');
            expect(result).toBeUndefined();
        });
    });

    describe('has', () => {
        it('mavjud kalit — true', () => {
            store.set('user_456', { step: 'order', data: {} });
            expect(store.has('user_456')).toBe(true);
        });

        it('mavjud bo\'lmagan kalit — false', () => {
            expect(store.has('missing_key')).toBe(false);
        });
    });

    describe('delete', () => {
        it('mavjud kalitni o\'chirish — true', () => {
            store.set('user_789', { step: 'done', data: {} });
            const deleted = store.delete('user_789');

            expect(deleted).toBe(true);
            expect(store.has('user_789')).toBe(false);
        });

        it('mavjud bo\'lmagan kalitni o\'chirish — false', () => {
            const deleted = store.delete('nonexistent');
            expect(deleted).toBe(false);
        });
    });

    describe('clear', () => {
        it('barcha kalitlarni tozalash', () => {
            store.set('a', { step: '1', data: {} });
            store.set('b', { step: '2', data: {} });
            store.clear();

            expect(store.has('a')).toBe(false);
            expect(store.has('b')).toBe(false);
        });
    });

    describe('TTL (amal muddati)', () => {
        it('muddati o\'tgan sessiya — undefined qaytaradi', () => {
            const expiredStore = createTelegramSessionStore<string>(
                'expired_test',
                { ttlMs: 1 } // 1ms — darhol eskiradi
            );
            expiredStore.set('key', 'value');

            // Kichik kechikish
            const start = Date.now();
            while (Date.now() - start < 5) {} // 5ms kutish

            expect(expiredStore.get('key')).toBeUndefined();
        });
    });

    describe('chain pattern', () => {
        it('set chaining ishlaydi', () => {
            const result = store.set('a', { step: '1', data: {} })
                                .set('b', { step: '2', data: {} });

            expect(result).toBeDefined();
            expect(store.has('a')).toBe(true);
            expect(store.has('b')).toBe(true);
        });
    });
});
