import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { approveBotAccessRequest, rejectBotAccessRequest } from '../../../botAccessRequests';

export async function renderDriverAccessRequestCard(ctx: Context, requestId: number) {
    const request = await prisma.botAccessRequest.findUnique({
        where: { id: requestId },
        include: { requestedPoint: true, requestedSupervisor: true },
    });

    if (!request || request.role !== 'driver') {
        await ctx.answerCbQuery?.('Topilmadi');
        return;
    }

    const text =
        `📝 <b>Driver arizasi #${request.id}</b>\n\n` +
        `👤 ${request.name}\n` +
        `📞 <code>${request.phone}</code>\n` +
        `📨 Telegram: <code>${request.telegramId || '—'}</code>\n` +
        `🚗 Mashina: ${request.vehicleInfo || '—'}\n` +
        `👷 So'ralgan admin: ${request.requestedSupervisor?.name || 'tanlanmagan'}\n` +
        `🏭 Baza: ${request.requestedPoint?.regionUz || 'tanlanmagan'}\n` +
        `Holat: <b>${request.status}</b>`;

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Tasdiqlash', callback_data: `adm_req_drv_ok_${request.id}` },
                    { text: '❌ Rad etish', callback_data: `adm_req_drv_no_${request.id}` },
                ],
                [{ text: '◀️ Ortga', callback_data: 'adm_req_drv_list' }],
            ],
        },
    });
}

export async function handleDriverAccessCallbacks(
    ctx: Context,
    data: string,
    sup: { id: number; pointId: number | null; name: string },
) {
    if (data === 'adm_req_drv_list') {
        const requests = await prisma.botAccessRequest.findMany({
            where: {
                role: 'driver',
                status: 'pending',
                OR: [
                    { requestedSupervisorId: sup.id },
                    { requestedSupervisorId: null },
                    ...(sup.pointId ? [{ requestedPointId: sup.pointId }] : []),
                ],
            },
            orderBy: { createdAt: 'asc' },
            take: 10,
        });

        await ctx.answerCbQuery('📝');
        if (requests.length === 0) {
            await ctx.editMessageText('📝 Pending driver arizalari yo\'q.');
            return true;
        }

        await ctx.editMessageText('📝 <b>Driver arizalari</b>\nTasdiqlash yoki rad etish uchun tanlang:', {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: requests.flatMap((request) => [
                    [{ text: `${request.name} • ${request.phone}`, callback_data: `adm_req_drv_${request.id}` }],
                    [
                        { text: '✅ Tasdiqlash', callback_data: `adm_req_drv_ok_${request.id}` },
                        { text: '❌ Rad etish', callback_data: `adm_req_drv_no_${request.id}` },
                    ],
                ]),
            },
        });
        return true;
    }

    if (data.startsWith('adm_req_drv_ok_')) {
        const requestId = Number(data.replace('adm_req_drv_ok_', ''));
        const result = await approveBotAccessRequest(requestId, {
            approvedBySupervisorId: sup.id,
            supervisorId: sup.id,
            pointId: sup.pointId,
        });
        if (!('driver' in result)) {
            throw new Error('Driver arizasi tasdiqlanmadi');
        }

        await ctx.answerCbQuery('Tasdiqlandi');
        await ctx.editMessageText(
            `✅ <b>Driver arizasi tasdiqlandi</b>\n\n` +
            `👤 ${result.driver.name}\n` +
            `📞 <code>${result.driver.phone}</code>\n` +
            `🔑 Kod: <code>${result.driver.registrationCode || '—'}</code>`,
            { parse_mode: 'HTML' },
        );
        return true;
    }

    if (data.startsWith('adm_req_drv_no_')) {
        const requestId = Number(data.replace('adm_req_drv_no_', ''));
        await rejectBotAccessRequest(requestId, {
            rejectedBySupervisorId: sup.id,
            reason: 'Admin/Supervisor tomonidan rad etildi',
        });
        await ctx.answerCbQuery('Rad etildi');
        await ctx.editMessageText('❌ Driver arizasi rad etildi.');
        return true;
    }

    if (data.startsWith('adm_req_drv_')) {
        const requestId = Number(data.replace('adm_req_drv_', ''));
        await ctx.answerCbQuery('📝');
        await renderDriverAccessRequestCard(ctx, requestId);
        return true;
    }

    return false;
}
