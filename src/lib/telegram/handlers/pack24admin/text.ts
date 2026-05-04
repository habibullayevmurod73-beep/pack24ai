import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { getAccessIdentity, touchDbAdmin, formatEventRows, replyWithMenu } from './helpers';
import { renderSupervisorsList, renderDriversList, renderSupervisorAccessRequests } from './renders';
import { pack24AdminMainKeyboard } from '../../keyboards';

export function registerTextHandlers(bot: Telegraf) {
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (text.startsWith('/')) return;

        const hqAdmin = await getAccessIdentity(tgId);
        if (!hqAdmin) {
            await ctx.reply('❌ Siz HQ admin sifatida ulanmagansiz. /start ni bosing.');
            return;
        }

        await touchDbAdmin(hqAdmin);

        if (text === '👷 Masullar') {
            await renderSupervisorsList(ctx);
            return;
        }

        if (text === '🚚 Haydovchilar') {
            await renderDriversList(ctx);
            return;
        }

        if (text === '📝 Admin arizalari') {
            await renderSupervisorAccessRequests(ctx);
            return;
        }

        if (text === '📋 Jurnal tahrirlari') {
            const pending = await prisma.journalCorrectionRequest.findMany({
                where: { status: 'pending' },
                orderBy: { createdAt: 'asc' },
                take: 14,
                include: { supervisor: { select: { name: true } } },
            });

            if (pending.length === 0) {
                await ctx.reply('📋 Kutilayotgan jurnal tahrirlari yo\'q.', {
                    reply_markup: pack24AdminMainKeyboard(),
                });
                return;
            }

            const summary = pending
                .map((row) => `• <b>#${row.id}</b> ${row.supervisor.name}: ${row.summaryLine}`)
                .join('\n');

            await ctx.reply(
                `📋 <b>Jurnal tahrirlari (kutilmoqda)</b>\n\n${summary}\n\nTasdiqlash yoki rad — pastdagi tugmalar:`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: pending.map((row) => [
                            { text: `✅ #${row.id}`, callback_data: `pa_jcorr_ok_${row.id}` },
                            { text: `❌ #${row.id}`, callback_data: `pa_jcorr_no_${row.id}` },
                        ]),
                    },
                },
            );
            return;
        }

        if (text === '📡 Hodisalar') {
            const events = await prisma.botEvent.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    message: true,
                    sourceBot: true,
                    severity: true,
                    createdAt: true,
                    requestId: true,
                },
            });

            await ctx.reply(
                `📡 <b>So'nggi hodisalar</b>\n\n${formatEventRows(events)}`,
                { parse_mode: 'HTML', reply_markup: pack24AdminMainKeyboard() },
            );
            return;
        }

        if (text === '🚨 Ogohlantirishlar') {
            const events = await prisma.botEvent.findMany({
                where: {
                    OR: [
                        { status: 'new' },
                        { severity: { in: ['warning', 'error'] } },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    message: true,
                    sourceBot: true,
                    severity: true,
                    createdAt: true,
                    requestId: true,
                },
            });

            await ctx.reply(
                `🚨 <b>Yangi va muhim ogohlantirishlar</b>\n\n${formatEventRows(events)}`,
                { parse_mode: 'HTML', reply_markup: pack24AdminMainKeyboard() },
            );
            return;
        }

        if (text === '📊 Statistika') {
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const [all, unread, critical, grouped] = await Promise.all([
                prisma.botEvent.count({ where: { createdAt: { gte: since } } }),
                prisma.botEvent.count({ where: { status: 'new' } }),
                prisma.botEvent.count({
                    where: {
                        createdAt: { gte: since },
                        severity: { in: ['warning', 'error'] },
                    },
                }),
                prisma.botEvent.groupBy({
                    by: ['sourceBot'],
                    _count: { _all: true },
                    where: { createdAt: { gte: since } },
                }),
            ]);

            const lines = grouped
                .map((row) => `• ${row.sourceBot}: ${row._count._all}`)
                .join('\n') || '• Hali event yo\'q';

            await ctx.reply(
                `📊 <b>So'nggi 24 soat statistikasi</b>\n\n` +
                `Jami eventlar: <b>${all}</b>\n` +
                `Yangi eventlar: <b>${unread}</b>\n` +
                `Muhim alertlar: <b>${critical}</b>\n\n` +
                `${lines}`,
                { parse_mode: 'HTML', reply_markup: pack24AdminMainKeyboard() },
            );
            return;
        }

        if (text === '✅ Barchasini o\'qildi') {
            const result = await prisma.botEvent.updateMany({
                where: { status: 'new' },
                data: {
                    status: 'read',
                    processedAt: new Date(),
                },
            });

            await ctx.reply(
                `✅ ${result.count} ta hodisa o'qilgan deb belgilandi.`,
                { reply_markup: pack24AdminMainKeyboard() },
            );
            return;
        }

        if (text === '👤 Profil') {
            const unreadCount = await prisma.botEvent.count({ where: { status: 'new' } });
            await ctx.reply(
                `👤 <b>HQ admin profili</b>\n\n` +
                `Ism: <b>${hqAdmin.name}</b>\n` +
                `Telefon: <code>${hqAdmin.phone || '—'}</code>\n` +
                `Telegram: <code>${hqAdmin.telegramId || 'ulanmagan'}</code>\n` +
                `Kod: <code>${hqAdmin.registrationCode || '—'}</code>\n` +
                `Faol: ${hqAdmin.isActive ? 'ha' : 'yo\'q'}\n` +
                `Yangi hodisalar: <b>${unreadCount}</b>`,
                { parse_mode: 'HTML', reply_markup: pack24AdminMainKeyboard() },
            );
            return;
        }

        await replyWithMenu(ctx, hqAdmin.name);
    });
}
