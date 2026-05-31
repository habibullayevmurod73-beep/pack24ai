import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { RecycleRequestStatus, DriverStatus } from '@prisma/client';
import { getDriver } from '../helpers';
import { Lang, getText, formatText } from '../../../i18n';
import { btn } from '../../../keyboards';
import { notifyCustomer, notifyAdmin } from '../../../notifier';
import { createBotEvent } from '../../../botEvents';

export function registerTaskLifecycleCallbacks(bot: Telegraf) {
    bot.on('callback_query', async (ctx, next) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return next();
        const tgId = ctx.from.id.toString();

        const driver = await getDriver(tgId);
        if (!driver) {
            if (data.startsWith('accept_') || data.startsWith('reject_') || data.startsWith('enroute_') || data.startsWith('arrived_')) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
            }
            return next();
        }

        if (data.startsWith('accept_')) {
            const reqId = parseInt(data.replace('accept_', ''));
            const request = await prisma.recycleRequest.findUnique({
                where: { id: reqId },
                include: { point: true },
            });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌ Topshiriq topilmadi');
                return;
            }

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.assigned, assignedAt: new Date() },
            });

            await prisma.driver.update({
                where: { id: driver.id },
                data: { status: DriverStatus.busy },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.accepted',
                entityType: 'recycle_request',
                entityId: reqId,
                severity: 'success',
                title: 'Haydovchi topshiriqni qabul qildi',
                message: `${driver.name} ariza #${reqId} ni qabul qildi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.point?.id ?? request.pointId,
            });

            await ctx.answerCbQuery('✅');
            await ctx.editMessageText(
                formatText('drv_accepted', 'uz', { id: String(reqId) }),
                { parse_mode: 'HTML' }
            );

            if (request.customerTgId) {
                const lang = (request.customerLang as Lang) || 'uz';
                await notifyCustomer(
                    request.customerTgId,
                    formatText('notif_driver_assigned', lang, {
                        driver: driver.name,
                        phone: driver.phone,
                    })
                );
            }
            return;
        }

        if (data.startsWith('reject_')) {
            const reqId = parseInt(data.replace('reject_', ''));
            const request = await prisma.recycleRequest.findUnique({
                where: { id: reqId },
                include: { point: { include: { supervisors: { where: { isActive: true }, take: 1 } } } },
            });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌');
                return;
            }

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.new_, assignedDriverId: null, assignedAt: null },
            });
            await prisma.driver.update({
                where: { id: driver.id },
                data: { status: DriverStatus.active },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.rejected',
                entityType: 'recycle_request',
                entityId: reqId,
                severity: 'warning',
                title: 'Haydovchi topshiriqni rad etdi',
                message: `${driver.name} ariza #${reqId} ni rad etdi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.point?.id ?? request.pointId,
            });

            await ctx.answerCbQuery('❌');
            await ctx.editMessageText(
                formatText('drv_rejected', 'uz', { id: String(reqId) }),
                { parse_mode: 'HTML' }
            );

            const sup = request.point?.supervisors?.[0];
            if (sup?.telegramId) {
                await notifyAdmin(
                    sup.telegramId,
                    `⚠️ Haydovchi <b>${driver.name}</b> topshiriq <b>#${reqId}</b> ni rad etdi.\n\nQayta tayinlang.`
                );
            }
            return;
        }

        if (data.startsWith('enroute_')) {
            const reqId = parseInt(data.replace('enroute_', ''));
            const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌');
                return;
            }

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.en_route, driverEnRouteAt: new Date() },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.en_route',
                entityType: 'recycle_request',
                entityId: reqId,
                title: 'Haydovchi yo\'lga chiqdi',
                message: `${driver.name} ariza #${reqId} uchun yo'lga chiqdi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.pointId,
            });

            await ctx.answerCbQuery('🚚');
            await ctx.editMessageText(getText('drv_en_route', 'uz'), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn('📍 Yetib keldim', `arrived_${reqId}`)],
                    ],
                },
            });

            if (request.customerTgId) {
                const lang = (request.customerLang as Lang) || 'uz';
                await notifyCustomer(
                    request.customerTgId,
                    formatText('notif_en_route', lang, { driver: driver.name })
                );
            }
            return;
        }

        if (data.startsWith('arrived_')) {
            const reqId = parseInt(data.replace('arrived_', ''));
            const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
            if (!request || request.assignedDriverId !== driver.id) {
                await ctx.answerCbQuery('❌');
                return;
            }

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.arrived, driverArrivedAt: new Date() },
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'request.arrived',
                entityType: 'recycle_request',
                entityId: reqId,
                title: 'Haydovchi manzilga yetib keldi',
                message: `${driver.name} ariza #${reqId} joyiga yetib keldi.`,
                requestId: reqId,
                driverId: driver.id,
                pointId: request.pointId,
            });

            await ctx.answerCbQuery('📍');
            await ctx.editMessageText(getText('drv_arrived', 'uz'), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn('⚖️ Kalkulyator', `calc_${reqId}`)],
                    ],
                },
            });

            if (request.customerTgId) {
                const lang = (request.customerLang as Lang) || 'uz';
                await notifyCustomer(
                    request.customerTgId,
                    formatText('notif_arrived', lang, { driver: driver.name })
                );
            }
            return;
        }

        return next();
    });
}
