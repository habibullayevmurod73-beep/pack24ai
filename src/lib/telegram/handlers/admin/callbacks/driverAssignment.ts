import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { Lang, formatText, getText } from '../../../i18n';
import { createBotEvent } from '../../../botEvents';
import { notifyCustomer, notifyDriver } from '../../../notifier';
import { assignDriverKeyboard, btn } from '../../../keyboards';
import { volLabel } from '../../../adminBot.shared';

export async function handleDriverAssignmentCallbacks(
    ctx: Context,
    data: string,
    sup: { id: number; pointId: number | null; name: string },
) {
    if (data.startsWith('assign_driver_')) {
        const reqId = parseInt(data.replace('assign_driver_', ''), 10);
        const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
        if (!request) {
            await ctx.answerCbQuery('❌ Ariza topilmadi');
            return true;
        }

        const { mapLegacyMaterial } = await import('@/lib/tariffs');
        const tariffId = mapLegacyMaterial(request.material);
        const baseWhere = {
            isOnline: true,
            status: { in: ['active'] } as { in: ('active' | 'inactive')[] },
            ...(sup.pointId ? { pointId: sup.pointId } : {}),
        };

        let drivers = tariffId
            ? await prisma.driver.findMany({
                where: { ...baseWhere, acceptedMaterials: { has: tariffId } },
                orderBy: { lastSeenAt: 'desc' },
                take: 10,
            })
            : await prisma.driver.findMany({
                where: baseWhere,
                orderBy: { lastSeenAt: 'desc' },
                take: 10,
            });

        if (drivers.length === 0 && tariffId) {
            drivers = await prisma.driver.findMany({
                where: baseWhere,
                orderBy: { lastSeenAt: 'desc' },
                take: 10,
            });
        }

        if (drivers.length === 0) {
            await ctx.answerCbQuery('❌');
            await ctx.editMessageText(getText('adm_no_drivers', 'uz'), { parse_mode: 'HTML' });
            return true;
        }

        await ctx.answerCbQuery('🚚');
        await ctx.editMessageText(
            formatText('adm_select_driver', 'uz', { id: String(reqId) }),
            {
                parse_mode: 'HTML',
                reply_markup: assignDriverKeyboard(drivers, reqId),
            }
        );
        return true;
    }

    if (data.startsWith('select_drv_')) {
        const parts = data.replace('select_drv_', '').split('_');
        const driverId = parseInt(parts[0], 10);
        const reqId = parseInt(parts[1], 10);

        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        const request = await prisma.recycleRequest.findUnique({
            where: { id: reqId },
            include: { point: true },
        });

        if (!driver || !request) {
            await ctx.answerCbQuery('❌ Topilmadi');
            return true;
        }

        await prisma.recycleRequest.update({
            where: { id: reqId },
            data: {
                assignedDriverId: driverId,
                assignedAt: new Date(),
                status: 'assigned',
                supervisorId: sup.id,
                dispatchedAt: new Date(),
            },
        });

        await prisma.driver.update({
            where: { id: driverId },
            data: { status: 'busy' },
        });

        await createBotEvent({
            sourceBot: 'supervisor',
            eventType: 'request.assigned',
            entityType: 'recycle_request',
            entityId: reqId,
            severity: 'success',
            title: 'Haydovchi tayinlandi',
            message: `${sup.name} ariza #${reqId} uchun ${driver.name} ni tayinladi.`,
            requestId: reqId,
            driverId,
            supervisorId: sup.id,
            pointId: request.point?.id ?? request.pointId,
        });

        await ctx.answerCbQuery('✅');
        await ctx.editMessageText(
            formatText('adm_driver_assigned', 'uz', {
                id: String(reqId),
                driver: driver.name,
            }),
            { parse_mode: 'HTML' }
        );

        if (driver.telegramId) {
            const volText = volLabel(request.volumeSize);
            const driverMsg =
                `🆕 <b>Yangi topshiriq #${reqId}</b>\n\n` +
                `👤 ${request.name}\n` +
                `📞 ${request.phone}\n` +
                `📍 ${request.point?.regionUz || '—'}\n` +
                `⚖️ Hajm: ${volText}\n` +
                `📸 Rasm: ${request.photoUrl ? 'Bor ✅' : 'Yo\'q'}\n` +
                `🕐 ${new Date(request.createdAt).toLocaleString('ru-RU')}\n\n` +
                `Qabul qilasizmi?`;

            await notifyDriver(driver.telegramId, driverMsg, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            btn('✅ Qabul', `accept_${reqId}`),
                            btn('❌ Rad', `reject_${reqId}`),
                        ],
                        [btn('🚚 Yo\'lga chiqdim', `enroute_${reqId}`)],
                    ],
                },
            });
        }

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
        return true;
    }

    return false;
}
