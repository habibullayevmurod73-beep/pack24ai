import { CorrectionEntityType } from '@/lib/domain/recycling/journalCorrections';
import { startOfDay, endOfDay } from '@/lib/domain/recycling/journal';
import { prisma } from '@/lib/prisma';
import { fmtN, humanJournalDate } from '../../../adminBot.shared';

export async function fetchRows(entity: CorrectionEntityType, supervisorId: number, day: Date, take = 15) {
    const from = startOfDay(day);
    const to = endOfDay(day);

    switch (entity) {
        case 'manual_intake':
            return prisma.recycleManualIntake.findMany({
                where: { supervisorId, date: { gte: from, lt: to } },
                orderBy: { id: 'desc' },
                take,
            });
        case 'press_log':
            return prisma.recyclePressLog.findMany({
                where: { supervisorId, date: { gte: from, lt: to } },
                orderBy: { id: 'desc' },
                take,
            });
        case 'expense_log':
            return prisma.recycleExpenseLog.findMany({
                where: { supervisorId, date: { gte: from, lt: to } },
                orderBy: { id: 'desc' },
                take,
            });
        case 'daily_cash':
            return prisma.recycleDailyCash.findMany({
                where: { supervisorId, date: { gte: from, lt: to } },
                orderBy: { id: 'desc' },
                take,
            });
        case 'sales_log':
            return prisma.recycleSalesLog.findMany({
                where: { supervisorId, date: { gte: from, lt: to } },
                orderBy: { id: 'desc' },
                take,
            });
        default:
            return [];
    }
}

export async function serializeRow(entity: CorrectionEntityType, id: number, supervisorId: number) {
    switch (entity) {
        case 'manual_intake': {
            const r = await prisma.recycleManualIntake.findFirst({
                where: { id, supervisorId },
            });
            if (!r) return null;
            return {
                date: r.date.toISOString(),
                weightKg: r.weightKg,
                pricePerKg: r.pricePerKg,
                note: r.note,
            };
        }
        case 'press_log': {
            const r = await prisma.recyclePressLog.findFirst({ where: { id, supervisorId } });
            if (!r) return null;
            return {
                date: r.date.toISOString(),
                pressedKg: r.pressedKg,
                baleCount: r.baleCount,
                operators: r.operators,
                note: r.note,
            };
        }
        case 'expense_log': {
            const r = await prisma.recycleExpenseLog.findFirst({ where: { id, supervisorId } });
            if (!r) return null;
            return {
                date: r.date.toISOString(),
                expenseAmount: r.expenseAmount,
                advanceAmount: r.advanceAmount,
                comment: r.comment,
            };
        }
        case 'daily_cash': {
            const r = await prisma.recycleDailyCash.findFirst({ where: { id, supervisorId } });
            if (!r) return null;
            return {
                date: r.date.toISOString(),
                openingBalance: r.openingBalance,
                note: r.note,
            };
        }
        case 'sales_log': {
            const r = await prisma.recycleSalesLog.findFirst({ where: { id, supervisorId } });
            if (!r) return null;
            return {
                date: r.date.toISOString(),
                customerName: r.customerName,
                weightKg: r.weightKg,
                baleCount: r.baleCount,
                pricePerKg: r.pricePerKg,
                vehicleType: r.vehicleType,
                plateNumber: r.plateNumber,
                note: r.note,
            };
        }
        default:
            return null;
    }
}

export function summarize(entity: CorrectionEntityType, draft: Record<string, unknown>): string {
    switch (entity) {
        case 'manual_intake':
            return (
                `Qabul #${draft._id}| ` +
                `${humanJournalDate(new Date(String(draft.date)))}: ` +
                `${fmtN(Math.round(Number(draft.weightKg)))} kg × ${fmtN(Math.round(Number(draft.pricePerKg)))}`
            );
        case 'press_log':
            return (
                `Press #${draft._id}| ` +
                `${humanJournalDate(new Date(String(draft.date)))}: ` +
                `${fmtN(Math.round(Number(draft.pressedKg)))} kg, ${draft.baleCount} toy`
            );
        case 'expense_log':
            return (
                `Xarajat #${draft._id}| ${humanJournalDate(new Date(String(draft.date)))}: ` +
                `xarajat ${fmtN(Math.round(Number(draft.expenseAmount)))} · avans ${fmtN(Math.round(Number(draft.advanceAmount)))}`
            );
        case 'daily_cash':
            return (
                `Kassa #${draft._id}| ${humanJournalDate(new Date(String(draft.date)))}: ` +
                `${fmtN(Math.round(Number(draft.openingBalance)))} so'm`
            );
        case 'sales_log':
            return (
                `Sotuv #${draft._id}| ${String(draft.customerName)} · ` +
                `${humanJournalDate(new Date(String(draft.date)))}: ` +
                `${fmtN(Math.round(Number(draft.weightKg)))} kg`
            );
        default:
            return `#${draft._id}`;
    }
}

export function sanitizeDraft(entity: CorrectionEntityType, draft: Record<string, unknown>): Record<string, unknown> {
    switch (entity) {
        case 'manual_intake':
            return {
                date: draft.date,
                weightKg: Number(draft.weightKg),
                pricePerKg: Number(draft.pricePerKg),
                note: draft.note ?? null,
            };
        case 'press_log':
            return {
                date: draft.date,
                pressedKg: Number(draft.pressedKg),
                baleCount: Math.round(Number(draft.baleCount)),
                operators: draft.operators ?? null,
                note: draft.note ?? null,
            };
        case 'expense_log':
            return {
                date: draft.date,
                expenseAmount: Number(draft.expenseAmount) || 0,
                advanceAmount: Number(draft.advanceAmount) || 0,
                comment: draft.comment ?? null,
            };
        case 'daily_cash':
            return {
                date: draft.date,
                openingBalance: Number(draft.openingBalance),
                note: draft.note ?? null,
            };
        case 'sales_log':
            return {
                date: draft.date,
                customerName: String(draft.customerName),
                weightKg: Number(draft.weightKg),
                baleCount: Math.round(Number(draft.baleCount)) || 0,
                pricePerKg: Number(draft.pricePerKg),
                vehicleType: draft.vehicleType ?? null,
                plateNumber: draft.plateNumber ?? null,
                note: draft.note ?? null,
            };
        default:
            return draft;
    }
}
