import {
    buildReportsDateRange,
    calculateOrderSummaries,
    pctChange,
} from '@/lib/domain/admin/reports';

describe('admin reports domain', () => {
    it('pctChange previous 0 bo‘lsa 100 qaytaradi', () => {
        expect(pctChange(10, 0)).toBe(100);
        expect(pctChange(0, 0)).toBe(0);
    });

    it('custom date range ni hisoblaydi', () => {
        const result = buildReportsDateRange('30', '2026-04-01', '2026-04-10');
        expect(result.days).toBe(10);
        expect(result.from.getFullYear()).toBe(2026);
        expect(result.from.getMonth()).toBe(3);
        expect(result.from.getDate()).toBe(1);
    });

    it('invalid range uchun xato tashlaydi', () => {
        expect(() => buildReportsDateRange('30', '2026-04-10', '2026-04-01')).toThrow('INVALID_RANGE');
    });

    it('order summary va trendlarni hisoblaydi', () => {
        const result = calculateOrderSummaries(
            [
                { totalAmount: 100000, status: 'delivered', contactPhone: '+998901234567' },
                { totalAmount: 50000, status: 'cancelled', contactPhone: '+998901234567' },
                { totalAmount: 150000, status: 'processing', contactPhone: '+998998887766' },
            ],
            [
                { totalAmount: 100000, status: 'delivered', contactPhone: '+998901234567' },
            ],
            1
        );

        expect(result.current.count).toBe(3);
        expect(result.current.revenue).toBe(300000);
        expect(result.current.completed).toBe(1);
        expect(result.current.cancelled).toBe(1);
        expect(result.current.aov).toBe(100000);
        expect(result.current.repeatRate).toBe(50);
        expect(result.trends.ordersGrowth).toBe(200);
    });
});
