// ═══════════════════════════════════════════════════════════════════════════════
// Haydovchi buyruqlari — /ishlarim, /status, /hisobot (driver)
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { btn, fmtN, getStatusLabel } from '../constants';

export function registerDriverHandlers(bot: Telegraf) {

    // ── /ishlarim — Haydovchining aktiv ishlari ──────────────────────────
    bot.command('ishlarim', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (!driver) { ctx.reply('❌ Siz haydovchi sifatida ro\'yxatga olinmagansiz.'); return; }

        const requests = await prisma.recycleRequest.findMany({
            where: { assignedDriverId: driver.id, status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] } },
            include: { point: true },
            orderBy: { createdAt: 'desc' },
        });

        if (requests.length === 0) { ctx.reply('📋 Hozircha ish yo\'q. Dam oling! 😊'); return; }

        for (const r of requests) {
            const buttons: { text: string; callback_data: string }[][] = [];
            if (r.status === 'assigned') buttons.push([btn('✅ Qabul qildim — yo\'lga chiqaman', `enroute_${r.id}`)]);
            if (r.status === 'en_route') buttons.push([btn('📍 Yetib keldim', `arrived_${r.id}`)]);
            if (r.status === 'arrived') buttons.push([btn('📦 Yuk yig\'ishni boshlayman', `collecting_${r.id}`)]);
            if (r.status === 'collecting') buttons.push([btn('⚖️ Kalkulator — og\'irlik kiritish', `calc_${r.id}`)]);

            ctx.reply(
                `🚚 <b>Ish #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `👤 ${r.name} | 📞 ${r.phone}\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `${r.address ? `🏠 ${r.address}\n` : ''}` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }
            );
        }
    });

    // ── /status — Online/Offline almashish ───────────────────────────────
    bot.command('status', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (!driver) return;

        const newStatus = !driver.isOnline;
        await prisma.driver.update({ where: { id: driver.id }, data: { isOnline: newStatus, lastSeenAt: new Date() } });
        ctx.reply(newStatus ? '🟢 Siz endi <b>ONLINE</b> — ish qabul qilishingiz mumkin' : '⚫ Siz endi <b>OFFLINE</b> — dam oling', { parse_mode: 'HTML' });
    });

    // ── /hisobot — 30 kunlik hisobot (driver + supervisor) ──────────────
    bot.command('hisobot', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const from30 = new Date(); from30.setDate(from30.getDate() - 30);

        // Haydovchi hisoboti
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) {
            const cols = await prisma.recycleCollection.findMany({
                where: { driverId: driver.id, createdAt: { gte: from30 } },
                orderBy: { createdAt: 'desc' },
            });
            if (cols.length === 0) { ctx.reply('📊 Oxirgi 30 kunda yig\'ish yo\'q.'); return; }
            const totalAmt = cols.reduce((s, c) => s + c.totalAmount, 0);
            const totalKg  = cols.reduce((s, c) => s + c.actualWeight, 0);
            const paid = cols.filter(c => c.paymentStatus !== 'pending').length;
            const details = cols.slice(0, 5).map((c, i) =>
                `${i + 1}. #${c.requestId} — ${c.actualWeight}kg → ${fmtN(c.totalAmount)} so'm ${c.paymentStatus === 'pending' ? '⏳' : '✅'}`
            ).join('\n');
            ctx.reply(
                `📊 <b>Hisobotingiz (30 kun)</b>\n\n` +
                `📦 Yig'ishlar: <b>${cols.length}</b>\n` +
                `⚖️ Jami: <b>${totalKg.toFixed(1)} kg</b>\n` +
                `💵 Summa: <b>${fmtN(totalAmt)} so'm</b>\n` +
                `✅ To'langan: <b>${paid}/${cols.length}</b>\n\n` +
                `<b>Oxirgi 5 ta:</b>\n${details}`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Masul hisoboti
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (sup) {
            const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
            const dIds = drivers.map(d => d.id);
            const cols = await prisma.recycleCollection.findMany({
                where: { driverId: { in: dIds }, createdAt: { gte: from30 } },
                include: { driver: true },
            });
            const totalAmt = cols.reduce((s, c) => s + c.totalAmount, 0);
            const totalKg  = cols.reduce((s, c) => s + c.actualWeight, 0);
            const pending  = cols.filter(c => c.paymentStatus === 'pending').length;
            const byDrv = drivers.map(d => {
                const dc = cols.filter(c => c.driverId === d.id);
                return { name: d.name, count: dc.length, kg: dc.reduce((s, c) => s + c.actualWeight, 0), amt: dc.reduce((s, c) => s + c.totalAmount, 0) };
            }).filter(d => d.count > 0);
            const drvLines = byDrv.map(d => `🚚 ${d.name}: ${d.count} ta | ${d.kg.toFixed(0)} kg | ${fmtN(d.amt)} so'm`).join('\n');
            ctx.reply(
                `📊 <b>Jamoaviy hisobot (30 kun)</b>\n\n` +
                `📦 Jami: <b>${cols.length}</b>  ⚖️ <b>${totalKg.toFixed(1)} kg</b>\n` +
                `💵 Summa: <b>${fmtN(totalAmt)} so'm</b>\n` +
                `⏳ To'lanmagan: <b>${pending} ta</b>\n\n` +
                `<b>Haydovchilar:</b>\n${drvLines || 'Yig\'ish yo\'q'}`,
                { parse_mode: 'HTML' }
            );
            return;
        }
        ctx.reply('❌ Siz tizimda ro\'yxatga olinmagansiz.');
    });
}
