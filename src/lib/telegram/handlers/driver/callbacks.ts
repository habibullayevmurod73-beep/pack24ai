import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { getDriver, sessions } from './helpers';
import { Lang, getText, formatText } from '../../i18n';
import { btn, customerConfirmKeyboard } from '../../keyboards';
import { notifyCustomer, notifyAdmin } from '../../notifier';
import { createBotEvent } from '../../botEvents';
import { fmtN } from './types';

export function registerCallbackHandlers(bot: Telegraf) {
    bot.on('callback_query', async (ctx) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return;
        const tgId = ctx.from.id.toString();

        try {
            const driver = await getDriver(tgId);
            if (!driver) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
                return;
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
                    data: { status: 'assigned', assignedAt: new Date() },
                });

                await prisma.driver.update({
                    where: { id: driver.id },
                    data: { status: 'busy' },
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
                    pointId: request.point?.id ?? request.regionId,
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
                    data: { status: 'new', assignedDriverId: null, assignedAt: null },
                });
                await prisma.driver.update({
                    where: { id: driver.id },
                    data: { status: 'active' },
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
                    pointId: request.point?.id ?? request.regionId,
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
                    data: { status: 'en_route', driverEnRouteAt: new Date() },
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
                    pointId: request.regionId,
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
                    data: { status: 'arrived', driverArrivedAt: new Date() },
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
                    pointId: request.regionId,
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

            if (data.startsWith('calc_')) {
                const reqId = parseInt(data.replace('calc_', ''));
                const ses = sessions.get(tgId) || { step: 'menu' as const, lang: 'uz' as Lang };
                ses.step = 'weight';
                ses.activeRequestId = reqId;
                ses.driverId = driver.id;
                sessions.set(tgId, ses);

                await ctx.answerCbQuery('⚖️');
                await ctx.editMessageText(getText('drv_enter_weight', 'uz'), { parse_mode: 'HTML' });
                return;
            }

            if (data.startsWith('confirm_calc_')) {
                const reqId = parseInt(data.replace('confirm_calc_', ''));
                const ses = sessions.get(tgId);
                if (!ses || !ses.weight) return;

                const request = await prisma.recycleRequest.findUnique({
                    where: { id: reqId },
                    include: { point: true },
                });
                if (!request) return;

                const discount = ses.discount ?? 0;
                const pricePerKg = request.point?.pricePerKg || 800;
                const effectiveWeight = ses.weight * (1 - (discount / 100));
                const totalAmount = effectiveWeight * pricePerKg;

                const collection = await prisma.recycleCollection.create({
                    data: {
                        requestId: reqId,
                        driverId: driver.id,
                        actualWeight: ses.weight,
                        discountPercent: discount,
                        effectiveWeight: Math.round(effectiveWeight * 100) / 100,
                        pricePerKg,
                        totalAmount: Math.round(totalAmount),
                        collectedAt: new Date(),
                    },
                });

                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'collecting', collectedAt: new Date() },
                });

                await createBotEvent({
                    sourceBot: 'driver',
                    eventType: 'collection.created',
                    entityType: 'recycle_collection',
                    entityId: collection.id,
                    severity: 'success',
                    title: 'Haydovchi hisob-kitobni saqladi',
                    message:
                        `${driver.name} ariza #${reqId} uchun yig'ish hisob-kitobini saqladi: ` +
                        `${Math.round(totalAmount).toLocaleString('ru-RU')} so'm.`,
                    requestId: reqId,
                    collectionId: collection.id,
                    driverId: driver.id,
                    pointId: request.point?.id ?? request.regionId,
                    payload: {
                        actualWeight: ses.weight,
                        discountPercent: discount,
                        effectiveWeight: Math.round(effectiveWeight * 100) / 100,
                        totalAmount: Math.round(totalAmount),
                    },
                });

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(getText('drv_collection_saved', 'uz'), { parse_mode: 'HTML' });

                if (request.customerTgId) {
                    const lang = (request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        request.customerTgId,
                        formatText('notif_calc_confirm', lang, {
                            weight: String(ses.weight),
                            discount: String(discount),
                            effective: String(Math.round(effectiveWeight * 100) / 100),
                            price: fmtN(pricePerKg),
                            total: fmtN(Math.round(totalAmount)),
                        }),
                        { reply_markup: customerConfirmKeyboard(collection.id, lang as Lang) }
                    );
                }

                sessions.delete(tgId);
                return;
            }

            if (data === 'calc_cancel') {
                sessions.delete(tgId);
                await ctx.answerCbQuery('❌');
                await ctx.editMessageText('❌ Bekor qilindi.');
                return;
            }

        } catch (err) {
            console.error('[DriverBot] Callback error:', err);
            await ctx.answerCbQuery('❌ Xatolik').catch(() => {});
        }
    });
}
