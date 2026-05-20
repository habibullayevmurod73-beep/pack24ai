/**
 * Order Statuses Unit Tests
 * Domain: src/lib/domain/orderStatuses.ts
 */
import { describe, it, expect } from '@jest/globals';
import {
    orderStatuses,
    orderStatusLabels,
    canTransitionOrderStatus,
    isOrderStatus,
    canTransitionWorkOrderStatus,
    isWorkOrderStatus,
    isRecycleRequestStatus,
} from '@/lib/domain/orderStatuses';

describe('orderStatuses', () => {
    describe('orderStatuses & orderStatusLabels', () => {
        it('barcha statuslar uchun label mavjud', () => {
            expect(orderStatuses).toBeDefined();
            orderStatuses.forEach(status => {
                expect(orderStatusLabels[status]).toBeDefined();
                expect(typeof orderStatusLabels[status]).toBe('string');
            });
        });
    });

    describe('canTransitionOrderStatus', () => {
        it('new → processing — ruxsat beriladi', () => {
            const result = canTransitionOrderStatus('new', 'processing');
            expect(result).toBe(true);
        });

        it('delivered → new — ruxsat berilmaydi', () => {
            const result = canTransitionOrderStatus('delivered', 'new');
            expect(result).toBe(false);
        });

        it('bir xil status — ruxsat berilmaydi', () => {
            const result = canTransitionOrderStatus('new', 'new');
            expect(result).toBe(false);
        });
    });

    describe('isOrderStatus', () => {
        it('to\'g\'ri statuslarni tekshiradi', () => {
            expect(isOrderStatus('new')).toBe(true);
            expect(isOrderStatus('invalid_status')).toBe(false);
        });
    });

    describe('workOrderTransitions', () => {
        it('planned → in_progress — ruxsat beriladi', () => {
            expect(canTransitionWorkOrderStatus('planned', 'in_progress')).toBe(true);
        });
        it('completed → planned — ruxsat berilmaydi', () => {
            expect(canTransitionWorkOrderStatus('completed', 'planned')).toBe(false);
        });
    });

    describe('isRecycleRequestStatus', () => {
        it('to\'g\'ri statuslarni tekshiradi', () => {
            expect(isRecycleRequestStatus('assigned')).toBe(true);
            expect(isRecycleRequestStatus('unknown')).toBe(false);
        });
    });
});

