/**
 * Stock Validation Unit Tests
 * Domain: src/lib/domain/stockValidation.ts
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
    checkStock,
    formatStockErrors,
} from '@/lib/domain/stockValidation';

describe('stockValidation', () => {
    let mockTx: any;

    beforeEach(() => {
        mockTx = {
            inventory: {
                aggregate: jest.fn<any>(),
                findUnique: jest.fn<any>(),
                update: jest.fn<any>(),
                create: jest.fn<any>(),
            },
            product: {
                findUnique: jest.fn<any>(),
            },
            warehouse: {
                findMany: jest.fn<any>(),
                findFirst: jest.fn<any>(),
            },
            stockMovement: {
                create: jest.fn<any>(),
            },
            orderItem: {
                findMany: jest.fn<any>(),
            },
        };
    });

    describe('checkStock', () => {
        it('yetarli inventar mavjud — ok true qaytaradi', async () => {
            mockTx.inventory.aggregate.mockResolvedValue({
                _sum: { quantity: 150 },
            });

            const result = await checkStock(mockTx, [
                { productId: 1, quantity: 120 },
            ]);

            expect(result.ok).toBe(true);
        });

        it('inventar yetarli emas — ok false qaytaradi', async () => {
            mockTx.inventory.aggregate.mockResolvedValue({
                _sum: { quantity: 50 },
            });
            mockTx.product.findUnique.mockResolvedValue({
                name: 'Test Product',
            });

            const result = await checkStock(mockTx, [
                { productId: 1, quantity: 120 },
            ]);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0].available).toBe(50);
                expect(result.errors[0].productName).toBe('Test Product');
            }
        });
    });

    describe('formatStockErrors', () => {
        it('xatoliklarni to\'g\'ri formatlaydi', () => {
            const errors = [
                {
                    productId: 1,
                    productName: 'Box A',
                    requested: 10,
                    available: 4,
                },
            ];
            const formatted = formatStockErrors(errors);
            expect(formatted).toContain('"Box A" — omborda 4 ta bor, 10 ta so\'ralgan');
        });
    });
});

