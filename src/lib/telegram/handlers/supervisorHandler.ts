// ═══════════════════════════════════════════════════════════════════════════════
// Masul shaxs (Supervisor) buyruqlari
// /arizalar, /haydovchilar, /hisobot (masul), /tolash
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { btn, fmtN, getStatusLabel } from '../constants';

export function registerSupervisorHandlers(bot: Telegraf) {

    // ── /arizalar — Masulning aktiv arizalari ────────────────────────────
    bot.command('arizalar', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const supervisor = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!supervisor) { ctx.reply('❌ Siz masul shaxs sifatida ro\'yxatga olinmagansiz.'); return; }

        const requests = await prisma.recycleRequest.findMany({
            where: { supervisorId: supervisor.id, status: { in: ['dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] } },
            include: { point: true, assignedDriver: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        if (requests.length === 0) { ctx.reply('📋 Hozircha aktiv ariza yo\'q.'); return; }

        for (const r of requests) {
            const buttons: { text: string; callback_data: string }[][] = [];
            if (r.status === 'dispatched') {
                const drivers = await prisma.driver.findMany({
                    where: { supervisorId: supervisor.id, status: 'active' },
                });
                for (const d of drivers.slice(0, 5)) {
                    buttons.push([btn(`🚚 ${d.name}ga tayinlash`, `assign_${r.id}_${d.id}`)]);
                }
            }

            ctx.reply(
                `📋 <b>Ariza #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `👤 ${r.name} | 📞 ${r.phone}\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `${r.address ? `🏠 ${r.address}\n` : ''}` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}\n` +
                `${r.assignedDriver ? `🚚 Haydovchi: ${r.assignedDriver.name}` : ''}`,
                {
                    parse_mode: 'HTML',
                    ...(buttons.length > 0 && { reply_markup: { inline_keyboard: buttons } }),
                }
            );
        }
    });

    // ── /haydovchilar — Masulning haydovchilari ──────────────────────────
    bot.command('haydovchilar', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!sup) { ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.'); return; }

        const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
        if (drivers.length === 0) { ctx.reply('🚚 Haydovchilar yo\'q.'); return; }

        const list = drivers.map((d) =>
            `${d.isOnline ? '🟢' : '⚫'} <b>${d.name}</b> — ${d.status === 'on_route' ? '🚚 Yo\'lda' : d.status === 'busy' ? '📦 Band' : d.isOnline ? 'Faol' : 'Offline'}\n   📞 ${d.phone}`
        ).join('\n\n');

        ctx.reply(`🚚 <b>Sizning haydovchilar (${drivers.length}):</b>\n\n${list}`, { parse_mode: 'HTML' });
    });

    // ── /hisobot (masul uchun) — 30 kunlik jamoaviy hisobot ──────────────
    // NOTE: /hisobot buyrug'i hisobot handler ichida masul+haydovchi uchun. Lekin masul-only qism shu yerda.

    // ── /tolash — Kutilayotgan to'lovlar ─────────────────────────────────
    bot.command('tolash', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!sup) { ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.'); return; }

        const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
        const dIds = drivers.map(d => d.id);
        const pending = await prisma.recycleCollection.findMany({
            where: { driverId: { in: dIds }, paymentStatus: 'pending', customerConfirmed: true },
            include: { request: { include: { point: true } }, driver: true },
            orderBy: { createdAt: 'desc' }, take: 10,
        });

        if (pending.length === 0) { ctx.reply('✅ To\'lanmagan (tasdiqlangan) yig\'ishlar yo\'q.'); return; }

        for (const coll of pending) {
            await ctx.reply(
                `💰 <b>To'lov kerak — Ariza #${coll.requestId}</b>\n\n` +
                `👤 ${coll.request.name} | ${coll.request.phone}\n` +
                `🚚 Haydovchi: ${coll.driver.name}\n` +
                `⚖️ Og'irlik: ${coll.actualWeight} kg\n` +
                `💵 Summa: <b>${fmtN(coll.totalAmount)} so'm</b>`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
                    [btn(`💵 Mijozga to'lash`, `pay_cust_${coll.id}`)],
                    [btn(`🚚 Haydovchiga to'lash (10%)`, `pay_drv_${coll.id}`)],
                    [btn(`💰 Ikkalasiga to'lash`, `pay_both_${coll.id}`)],
                ] } }
            );
        }
    });
}
