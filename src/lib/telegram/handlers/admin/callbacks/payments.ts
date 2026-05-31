import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/money';
import { Lang, formatText } from '../../../i18n';
import { createBotEvent } from '../../../botEvents';
import { notifyCustomer } from '../../../notifier';
import { fmtN } from '../../../adminBot.shared';

export async function handlePaymentCallbacks(
    ctx: Context,
    data: string,
    sup: { id: number; pointId: number | null; name: string },
) {
    if (data.startsWith('approve_payment_')) {
        const collId = parseInt(data.replace('approve_payment_', ''), 10);
        const collection = await prisma.recycleCollection.findUnique({
            where: { id: collId },
            include: { request: true, driver: true },
        });

        if (!collection) {
            await ctx.answerCbQuery('❌ Topilmadi');
            return true;
        }

        await prisma.recycleCollection.update({
            where: { id: collId },
            data: {
                paymentStatus: 'completed',
                paidAt: new Date(),
                paidBy: sup.name,
            },
        });

        await prisma.recycleRequest.update({
            where: { id: collection.requestId },
            data: { status: 'completed', completedAt: new Date() },
        });

        if (collection.driverId) {
            await prisma.driver.update({
                where: { id: collection.driverId },
                data: { status: 'active' },
            });
        }

        await createBotEvent({
            sourceBot: 'supervisor',
            eventType: 'payment.completed',
            entityType: 'recycle_collection',
            entityId: collId,
            severity: 'success',
            title: 'To\'lov tasdiqlandi',
            message:
                `${sup.name} ariza #${collection.requestId} bo'yicha ` +
                `${fmtN(Math.round(toNumber(collection.totalAmount)))} so'm to'lovni tasdiqladi.`,
            requestId: collection.requestId,
            collectionId: collection.id,
            driverId: collection.driverId,
            supervisorId: sup.id,
        });

        await ctx.answerCbQuery('✅');
        await ctx.editMessageText(
            formatText('adm_payment_approved', 'uz', { id: String(collId) }),
            { parse_mode: 'HTML' }
        );

        if (collection.request.customerTgId) {
            const lang = (collection.request.customerLang as Lang) || 'uz';
            await notifyCustomer(
                collection.request.customerTgId,
                lang === 'uz'
                    ? `✅ <b>Ariza #${collection.requestId} yakunlandi!</b>\n\n💰 To'lov: ${fmtN(Math.round(toNumber(collection.totalAmount)))} so'm\n\nRahmat! ♻️`
                    : lang === 'ru'
                    ? `✅ <b>Заявка #${collection.requestId} завершена!</b>\n\n💰 Оплата: ${fmtN(Math.round(toNumber(collection.totalAmount)))} сум\n\nСпасибо! ♻️`
                    : `✅ <b>Request #${collection.requestId} completed!</b>\n\n💰 Payment: ${fmtN(Math.round(toNumber(collection.totalAmount)))} UZS\n\nThank you! ♻️`
            );
        }
        return true;
    }

    return false;
}
