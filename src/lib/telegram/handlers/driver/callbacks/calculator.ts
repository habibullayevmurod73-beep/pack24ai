import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { RecycleRequestStatus } from '@prisma/client';
import { getDriver, sessions } from '../helpers';
import { Lang, getText, formatText } from '../../../i18n';
import { customerConfirmKeyboard } from '../../../keyboards';
import { notifyCustomer } from '../../../notifier';
import { createBotEvent } from '../../../botEvents';
import { toDecimal, roundUZS, toNumber } from '@/lib/money';
import { fmtN } from '../types';

export function registerCalculatorCallbacks(bot: Telegraf) {
    bot.on('callback_query', async (ctx, next) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return next();
        const tgId = ctx.from.id.toString();

        const driver = await getDriver(tgId);
        if (!driver) {
            if (data.startsWith('calc_') || data.startsWith('confirm_calc_') || data === 'calc_cancel') {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
            }
            return next();
        }

        if (data.startsWith('calc_') && !data.startsWith('calc_cancel')) {
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
            const pricePerKg = toNumber(request.point?.pricePerKg) || 800;
            const effectiveWeight = ses.weight * (1 - (discount / 100));
            const totalAmount = effectiveWeight * pricePerKg;

            const collection = await prisma.recycleCollection.create({
                data: {
                    requestId: reqId,
                    driverId: driver.id,
                    actualWeight: ses.weight,
                    discountPercent: discount,
                    effectiveWeight: Math.round(effectiveWeight * 100) / 100,
                    pricePerKg: toDecimal(pricePerKg),
                    totalAmount: toDecimal(roundUZS(totalAmount)),
                    collectedAt: new Date(),
                },
            });

            await prisma.recycleRequest.update({
                where: { id: reqId },
                data: { status: RecycleRequestStatus.collecting, collectedAt: new Date() },
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
                pointId: request.point?.id ?? request.pointId,
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

        return next();
    });
}
