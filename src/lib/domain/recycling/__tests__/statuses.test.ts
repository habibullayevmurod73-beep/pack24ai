import {
    canTransitionRecycleRequestStatus,
    isRecycleCollectionPaymentStatus,
} from '@/lib/domain/recycling/statuses';

describe('recycling statuses', () => {
    it('new dan assigned ga o‘tishga ruxsat beradi', () => {
        expect(canTransitionRecycleRequestStatus('new', 'assigned')).toBe(true);
    });

    it('assigned dan collected ga to‘g‘ridan-to‘g‘ri o‘tishga ruxsat bermaydi', () => {
        expect(canTransitionRecycleRequestStatus('assigned', 'collected')).toBe(false);
    });

    it('collecting dan collected ga o‘tishga ruxsat beradi', () => {
        expect(canTransitionRecycleRequestStatus('collecting', 'collected')).toBe(true);
    });

    it('completed dan boshqa statusga o‘tishga ruxsat bermaydi', () => {
        expect(canTransitionRecycleRequestStatus('completed', 'cancelled')).toBe(false);
    });

    it('to‘g‘ri payment statusni taniydi', () => {
        expect(isRecycleCollectionPaymentStatus('pending')).toBe(true);
        expect(isRecycleCollectionPaymentStatus('paid_both')).toBe(true);
    });

    it('noto‘g‘ri payment statusni rad etadi', () => {
        expect(isRecycleCollectionPaymentStatus('paid')).toBe(false);
        expect(isRecycleCollectionPaymentStatus('unknown')).toBe(false);
    });
});
