import {
    buildMonthlyJournalView,
    calculateDailyJournalSummary,
    monthRange,
    parseJournalDate,
} from '@/lib/domain/recycling/journal';

describe('recycling journal domain', () => {
    it('bugun matnini sana sifatida parse qiladi', () => {
        const result = parseJournalDate('bugun');
        expect(result).toBeInstanceOf(Date);
    });

    it('noto‘g‘ri sanani null qaytaradi', () => {
        expect(parseJournalDate('2026/01/10')).toBeNull();
    });

    it('monthRange month formatini yaratadi', () => {
        const range = monthRange('2026-02');
        expect(range.rawMonth).toBe('2026-02');
        expect(range.daysInMonth).toBe(28);
    });

    it('kunlik summary hisobini to‘g‘ri qaytaradi', () => {
        const summary = calculateDailyJournalSummary({
            openingBalance: 100000,
            intakes: [{ weightKg: 100, totalAmount: 200000 }],
            presses: [{ pressedKg: 80, baleCount: 5 }],
            expenses: [{ expenseAmount: 10000, advanceAmount: 5000 }],
            salesRows: [{ weightKg: 60, baleCount: 4, totalAmount: 300000 }],
        });

        expect(summary.closingBalance).toBe(185000);
        expect(summary.intakeWeight).toBe(100);
        expect(summary.soldAmount).toBe(300000);
    });

    it('oylik view ni kunlar bo‘yicha jamlaydi', () => {
        const month = buildMonthlyJournalView({
            rawMonth: '2026-04',
            daysInMonth: 30,
            intakes: [
                { date: new Date('2026-04-01T00:00:00'), weightKg: 100, totalAmount: 200000 },
                { date: new Date('2026-04-01T12:00:00'), weightKg: 50, totalAmount: 90000 },
            ],
            presses: [
                { date: new Date('2026-04-01T00:00:00'), pressedKg: 120, baleCount: 7, operators: 'Ali; Vali' },
            ],
            sales: [
                {
                    date: new Date('2026-04-01T00:00:00'),
                    customerName: 'Acme',
                    weightKg: 60,
                    baleCount: 4,
                    totalAmount: 240000,
                    vehicleType: 'Kamaz',
                    plateNumber: '01A123BC',
                },
            ],
            expenses: [
                { date: new Date('2026-04-01T00:00:00'), expenseAmount: 10000, advanceAmount: 5000, comment: 'Ish haqi' },
            ],
            cashLogs: [
                { date: new Date('2026-04-01T00:00:00'), openingBalance: 50000 },
            ],
        });

        expect(month.intakeRows[0].weightKg).toBe(150);
        expect(month.pressRows[0].baleCount).toBe(7);
        expect(month.salesRows[0].totalAmount).toBe(240000);
        expect(month.cashRows[0].closingBalance).toBe(-15000);
        expect(month.totals.intakeAmount).toBe(290000);
    });
});
