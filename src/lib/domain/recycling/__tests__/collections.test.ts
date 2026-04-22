import {
    calculateCollectionAmounts,
    normalizeCreateCollectionInput,
} from '@/lib/domain/recycling/collections';

describe('recycling collections domain', () => {
    it('effectiveWeight, totalAmount va ecoPoints ni hisoblaydi', () => {
        expect(calculateCollectionAmounts(100, 10, 2000)).toEqual({
            effectiveWeight: 90,
            totalAmount: 180000,
            ecoPoints: 90,
        });
    });

    it('discount 0 bo‘lsa to‘liq summani qaytaradi', () => {
        expect(calculateCollectionAmounts(12.5, 0, 3000)).toEqual({
            effectiveWeight: 12.5,
            totalAmount: 37500,
            ecoPoints: 13,
        });
    });

    it('to‘g‘ri inputni normalize qiladi', () => {
        const result = normalizeCreateCollectionInput({
            requestId: '10',
            driverId: '7',
            actualWeight: '125.5',
            discountPercent: '5',
            pricePerKg: '2100',
            materialType: 'karton',
            notes: '  izoh  ',
            discountReason: 'namlik',
        });

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.data).toEqual({
            requestId: 10,
            driverId: 7,
            actualWeight: 125.5,
            discountPercent: 5,
            pricePerKg: 2100,
            materialType: 'karton',
            notes: 'izoh',
            discountReason: 'namlik',
        });
    });

    it('majburiy qiymatlar noto‘g‘ri bo‘lsa xato qaytaradi', () => {
        expect(normalizeCreateCollectionInput({
            requestId: 0,
            driverId: 7,
            actualWeight: 100,
            pricePerKg: 2000,
        })).toEqual({
            ok: false,
            error: 'requestId majburiy',
        });
    });

    it('discount 100 dan katta bo‘lsa xato qaytaradi', () => {
        expect(normalizeCreateCollectionInput({
            requestId: 1,
            driverId: 2,
            actualWeight: 100,
            discountPercent: 120,
            pricePerKg: 2000,
        })).toEqual({
            ok: false,
            error: 'discountPercent 0 va 100 oralig\'ida bo\'lishi kerak',
        });
    });
});
