import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { pack24AdminMainKeyboard } from '../../keyboards';

export async function renderSupervisorsList(ctx: Context) {
    const supervisors = await prisma.supervisor.findMany({
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        take: 12,
        include: { point: true },
    });

    if (supervisors.length === 0) {
        await ctx.reply('👷 Masullar ro\'yxati bo\'sh.', {
            reply_markup: pack24AdminMainKeyboard(),
        });
        return;
    }

    await ctx.reply(
        '👷 <b>Masullar ro\'yxati</b>\nKerakli xodimni tanlang:',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...supervisors.map((sup) => [{
                        text: `${sup.isActive ? '🟢' : '🔴'} ${sup.name}`,
                        callback_data: `pa_sup_${sup.id}`,
                    }]),
                ],
            },
        },
    );
}

export async function renderDriversList(ctx: Context) {
    const drivers = await prisma.driver.findMany({
        orderBy: [{ isOnline: 'desc' }, { createdAt: 'desc' }],
        take: 12,
        include: { point: true, supervisor: true },
    });

    if (drivers.length === 0) {
        await ctx.reply('🚚 Haydovchilar ro\'yxati bo\'sh.', {
            reply_markup: pack24AdminMainKeyboard(),
        });
        return;
    }

    await ctx.reply(
        '🚚 <b>Haydovchilar ro\'yxati</b>\nKerakli xodimni tanlang:',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...drivers.map((driver) => [{
                        text: `${driver.isOnline ? '🟢' : driver.status === 'inactive' ? '⛔' : '⚪'} ${driver.name}`,
                        callback_data: `pa_drv_${driver.id}`,
                    }]),
                ],
            },
        },
    );
}

export async function renderSupervisorAccessRequests(ctx: Context) {
    const requests = await prisma.botAccessRequest.findMany({
        where: { role: 'supervisor', status: 'pending' },
        orderBy: { createdAt: 'asc' },
        take: 10,
    });

    if (requests.length === 0) {
        await ctx.reply('📝 Hozircha pending admin arizalari yo\'q.', {
            reply_markup: pack24AdminMainKeyboard(),
        });
        return;
    }

    await ctx.reply('📝 <b>Admin arizalari</b>\nTasdiqlash yoki rad etish uchun tanlang:', {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: requests.flatMap((request) => [
                [{
                    text: `${request.name} • ${request.phone}`,
                    callback_data: `pa_req_sup_${request.id}`,
                }],
                [
                    { text: '✅ Tasdiqlash', callback_data: `pa_req_sup_ok_${request.id}` },
                    { text: '❌ Rad etish', callback_data: `pa_req_sup_no_${request.id}` },
                ],
            ]),
        },
    });
}

export async function renderSupervisorAccessRequestCard(ctx: Context, requestId: number) {
    const request = await prisma.botAccessRequest.findUnique({
        where: { id: requestId },
        include: { requestedPoint: true },
    });

    if (!request || request.role !== 'supervisor') {
        if ('answerCbQuery' in ctx) await ctx.answerCbQuery('Topilmadi');
        return;
    }

    const text =
        `📝 <b>Admin arizasi #${request.id}</b>\n\n` +
        `👤 ${request.name}\n` +
        `📞 <code>${request.phone}</code>\n` +
        `📨 Telegram: <code>${request.telegramId || '—'}</code>\n` +
        `🏭 Baza: ${request.requestedPoint?.regionUz || 'tanlanmagan'}\n` +
        `Holat: <b>${request.status}</b>\n` +
        `Sana: ${request.createdAt.toLocaleString('ru-RU')}`;

    const reply_markup = {
        inline_keyboard: [
            [
                { text: '✅ Tasdiqlash', callback_data: `pa_req_sup_ok_${request.id}` },
                { text: '❌ Rad etish', callback_data: `pa_req_sup_no_${request.id}` },
            ],
            [{ text: '⬅️ Arizalar', callback_data: 'pa_req_sup_list' }],
        ],
    };

    if (ctx.callbackQuery && 'editMessageText' in ctx) {
        await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup });
        return;
    }

    await ctx.reply(text, { parse_mode: 'HTML', reply_markup });
}

export async function renderSupervisorCard(ctx: Context, supervisorId: number) {
    const supervisor = await prisma.supervisor.findUnique({
        where: { id: supervisorId },
        include: {
            point: true,
            _count: { select: { drivers: true, requests: true } },
        },
    });

    if (!supervisor) {
        if ('answerCbQuery' in ctx) await ctx.answerCbQuery('Topilmadi');
        return;
    }

    const text =
        `👷 <b>${supervisor.name}</b>\n\n` +
        `📞 ${supervisor.phone}\n` +
        `🏭 Baza: ${supervisor.point?.regionUz || '—'}\n` +
        `📨 Telegram: ${supervisor.telegramId || 'ulanmagan'}\n` +
        `🔑 Kod: <code>${supervisor.registrationCode || '—'}</code>\n` +
        `📊 Haydovchilar: ${supervisor._count.drivers} | Arizalar: ${supervisor._count.requests}\n` +
        `🔐 Holat: ${supervisor.isActive ? 'faol' : 'bloklangan'}`;

    if ('editMessageText' in ctx) {
        await ctx.editMessageText(text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: supervisor.isActive ? '⛔ Bloklash' : '✅ Faollashtirish', callback_data: `pa_sup_toggle_${supervisor.id}` }],
                    [{ text: '🔁 Kodni yangilash', callback_data: `pa_sup_code_${supervisor.id}` }],
                    [{ text: '⬅️ Ortga', callback_data: 'pa_list_sup' }],
                ],
            },
        });
        return;
    }

    await (ctx as Context).reply(text, { parse_mode: 'HTML' });
}

export async function renderDriverCard(ctx: Context, driverId: number) {
    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
            point: true,
            supervisor: true,
            _count: { select: { collections: true, assignedRequests: true } },
        },
    });

    if (!driver) {
        if ('answerCbQuery' in ctx) await ctx.answerCbQuery('Topilmadi');
        return;
    }

    const text =
        `🚚 <b>${driver.name}</b>\n\n` +
        `📞 ${driver.phone}\n` +
        `🏭 Baza: ${driver.point?.regionUz || '—'}\n` +
        `👷 Masul: ${driver.supervisor?.name || '—'}\n` +
        `📨 Telegram: ${driver.telegramId || 'ulanmagan'}\n` +
        `🔑 Kod: <code>${driver.registrationCode || '—'}</code>\n` +
        `📊 Yig'ishlar: ${driver._count.collections} | Tayinlangan: ${driver._count.assignedRequests}\n` +
        `🔐 Status: ${driver.status} | ${driver.isOnline ? 'online' : 'offline'}`;

    if ('editMessageText' in ctx) {
        await ctx.editMessageText(text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: driver.status === 'inactive' ? '✅ Faollashtirish' : '⛔ Bloklash', callback_data: `pa_drv_toggle_${driver.id}` }],
                    [{ text: '🔁 Kodni yangilash', callback_data: `pa_drv_code_${driver.id}` }],
                    [{ text: '⬅️ Ortga', callback_data: 'pa_list_drv' }],
                ],
            },
        });
        return;
    }

    await (ctx as Context).reply(text, { parse_mode: 'HTML' });
}
