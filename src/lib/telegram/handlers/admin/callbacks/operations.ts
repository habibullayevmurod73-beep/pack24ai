import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/money';
import { formatText, getText } from '../../../i18n';
import { createBotEvent } from '../../../botEvents';
import { backKeyboard } from '../../../keyboards';
import { fmtN } from '../../../adminBot.shared';

export async function handleOperationsCallbacks(
    ctx: Context,
    data: string,
    sup: { id: number; pointId: number | null; name: string },
) {
    if (data.startsWith('toggle_point_')) {
        const pointId = parseInt(data.replace('toggle_point_', ''), 10);
        const point = await prisma.recyclePoint.findUnique({ where: { id: pointId } });
        if (!point) {
            await ctx.answerCbQuery('❌');
            return true;
        }

        const newStatus = !point.isAccepting;
        await prisma.recyclePoint.update({
            where: { id: pointId },
            data: { isAccepting: newStatus },
        });

        await createBotEvent({
            sourceBot: 'supervisor',
            eventType: 'point.accepting_toggled',
            entityType: 'recycle_point',
            entityId: pointId,
            severity: newStatus ? 'success' : 'warning',
            title: newStatus ? 'Punkt qabulga ochildi' : 'Punkt qabulga yopildi',
            message: `${sup.name} punkt #${pointId} holatini ${newStatus ? 'ochiq' : 'yopiq'} qildi.`,
            supervisorId: sup.id,
            pointId,
        });

        const statusText = newStatus ? getText('point_open', 'uz') : getText('point_closed', 'uz');
        await ctx.answerCbQuery('✅');
        await ctx.editMessageText(
            formatText('adm_point_toggled', 'uz', { status: statusText }),
            { parse_mode: 'HTML' }
        );
        return true;
    }

    if (data.startsWith('report_')) {
        const period = data.replace('report_', '');
        const from = new Date();

        if (period === 'today') {
            from.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
            from.setDate(from.getDate() - 7);
        } else if (period === 'month') {
            from.setMonth(from.getMonth() - 1);
        }

        const pointFilter = sup.pointId ? { pointId: sup.pointId } : {};

        const totalRequests = await prisma.recycleRequest.count({
            where: { ...pointFilter, createdAt: { gte: from } },
        });
        const completedRequests = await prisma.recycleRequest.count({
            where: { ...pointFilter, status: 'completed', completedAt: { gte: from } },
        });
        const collections = await prisma.recycleCollection.findMany({
            where: { createdAt: { gte: from } },
        });
        const intakeLogs = await prisma.recycleManualIntake.findMany({
            where: { supervisorId: sup.id, date: { gte: from } },
        });
        const pressLogs = await prisma.recyclePressLog.findMany({
            where: { supervisorId: sup.id, date: { gte: from } },
        });
        const expenseLogs = await prisma.recycleExpenseLog.findMany({
            where: { supervisorId: sup.id, date: { gte: from } },
        });
        const salesLogs = await prisma.recycleSalesLog.findMany({
            where: { supervisorId: sup.id, date: { gte: from } },
        });
        const totalWeight = collections.reduce((sum, row) => sum + row.actualWeight, 0);
        const totalAmount = collections.reduce((sum, row) => sum + toNumber(row.totalAmount), 0);
        const activeDrivers = await prisma.driver.count({
            where: {
                isOnline: true,
                ...(sup.pointId ? { pointId: sup.pointId } : {}),
            },
        });
        const intakeWeight = intakeLogs.reduce((sum, row) => sum + row.weightKg, 0);
        const intakeAmount = intakeLogs.reduce((sum, row) => sum + toNumber(row.totalAmount), 0);
        const pressedKg = pressLogs.reduce((sum, row) => sum + row.pressedKg, 0);
        const baleCount = pressLogs.reduce((sum, row) => sum + row.baleCount, 0);
        const expenseAmount = expenseLogs.reduce((sum, row) => sum + toNumber(row.expenseAmount), 0);
        const advanceAmount = expenseLogs.reduce((sum, row) => sum + toNumber(row.advanceAmount), 0);
        const soldWeight = salesLogs.reduce((sum, row) => sum + row.weightKg, 0);
        const soldAmount = salesLogs.reduce((sum, row) => sum + toNumber(row.totalAmount), 0);
        const soldBaleCount = salesLogs.reduce((sum, row) => sum + row.baleCount, 0);

        const periodLabel = period === 'today' ? 'Bugun' : period === 'week' ? 'Hafta' : 'Oy';

        await ctx.answerCbQuery('📊');
        await ctx.editMessageText(
            formatText('adm_report', 'uz', {
                period: periodLabel,
                requests: String(totalRequests),
                completed: String(completedRequests),
                weight: String(Math.round(totalWeight * 10) / 10),
                amount: fmtN(Math.round(totalAmount)),
                drivers: String(activeDrivers),
            }) +
            `\n\n📥 <b>Qo'lda qabul:</b> ${fmtN(Math.round(intakeWeight))} kg | ${fmtN(Math.round(intakeAmount))} so'm` +
            `\n🏭 <b>Press:</b> ${fmtN(Math.round(pressedKg))} kg | ${fmtN(baleCount)} toy` +
            `\n🚛 <b>Sotuv:</b> ${fmtN(Math.round(soldWeight))} kg | ${fmtN(soldBaleCount)} toy | ${fmtN(Math.round(soldAmount))} so'm` +
            `\n💸 <b>Xarajat:</b> ${fmtN(Math.round(expenseAmount))} so'm` +
            `\n💼 <b>Avans:</b> ${fmtN(Math.round(advanceAmount))} so'm`,
            { parse_mode: 'HTML' }
        );
        return true;
    }

    if (data.startsWith('driver_info_')) {
        const driverId = parseInt(data.replace('driver_info_', ''), 10);
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
            await ctx.answerCbQuery('❌ Haydovchi topilmadi');
            return true;
        }

        const totalCollections = await prisma.recycleCollection.count({
            where: { driverId: driver.id },
        });
        const totalWeightAgg = await prisma.recycleCollection.aggregate({
            where: { driverId: driver.id },
            _sum: { actualWeight: true },
        });

        await ctx.answerCbQuery('👤');
        await ctx.editMessageText(
            `👤 <b>${driver.name}</b>\n\n` +
            `📞 ${driver.phone}\n` +
            `🚗 Mashina: ${driver.vehicleInfo || '—'}\n` +
            `📊 Holat: ${driver.isOnline ? '🟢 Online' : '🔴 Offline'}\n` +
            `🔄 Status: ${driver.status}\n\n` +
            `📈 <b>Statistika:</b>\n` +
            `🔢 Jami yig'ishlar: ${totalCollections}\n` +
            `⚖️ Jami og'irlik: ${fmtN(Math.round((totalWeightAgg._sum.actualWeight || 0) * 10) / 10)} kg\n` +
            `📅 Ro'yxatdan: ${driver.registeredAt ? new Date(driver.registeredAt).toLocaleDateString('ru-RU') : '—'}`,
            {
                parse_mode: 'HTML',
                reply_markup: backKeyboard(),
            }
        );
        return true;
    }

    if (data === 'adm_cancel') {
        await ctx.answerCbQuery('❌');
        await ctx.editMessageText('❌ Bekor qilindi.');
        return true;
    }

    return false;
}
