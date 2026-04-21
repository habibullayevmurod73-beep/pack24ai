// ═══════════════════════════════════════════════════════════════════════════════
// Mijoz buyruqlari — /arizalarim, /buyurtma, /narxlar, /shikoyat, /help
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { MAT, btn, fmtN, getStatusLabel } from '../constants';

export function registerCustomerHandlers(bot: Telegraf) {

    // ── /arizalarim — Mijozning arizalari ────────────────────────────────
    bot.command('arizalarim', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const requests = await prisma.recycleRequest.findMany({
            where: { customerTgId: tgId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { point: true, assignedDriver: true },
        });

        if (requests.length === 0) { ctx.reply('📋 Sizda hali ariza yo\'q.\n\nYangi ariza uchun /ariza buyrug\'ini yuboring!'); return; }

        for (const r of requests) {
            ctx.reply(
                `📋 <b>Ariza #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}\n` +
                `${r.assignedDriver ? `🚚 Haydovchi: ${r.assignedDriver.name}\n` : ''}` +
                `📅 ${new Date(r.createdAt).toLocaleDateString('uz')}`,
                { parse_mode: 'HTML' }
            );
        }
    });

    // ── /narxlar — Material narxlari ─────────────────────────────────────
    bot.command('narxlar', async (ctx) => {
        const lines = Object.values(MAT).map(m => `${m.emoji} ${m.label}: <b>${fmtN(m.price)} so'm/kg</b>`).join('\n');
        await ctx.reply(
            `💰 <b>Material narxlari:</b>\n\n${lines}\n\n` +
            `<i>Narxlar o'zgarishi mumkin. Aniq narx yig'ish vaqtida belgilanadi.</i>\n\n` +
            `♻️ Makulatura topshirish: /ariza`,
            { parse_mode: 'HTML' }
        );
    });

    // ── /buyurtma — Buyurtmani kuzatish ──────────────────────────────────
    bot.command('buyurtma', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2 || isNaN(parseInt(args[1]))) {
            await ctx.reply(
                `📦 <b>Buyurtmani kuzatish</b>\n\n` +
                `Buyurtma raqamini yozing:\n<i>Masalan: /buyurtma 123</i>\n\n` +
                `Yoki quyidagi tugmani bosing:`,
                {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [
                        [btn('📋 So\'nggi buyurtmalarim', 'my_orders')],
                    ] },
                }
            );
            return;
        }

        const orderId = parseInt(args[1]);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: { select: { name: true, price: true } } } } },
        });
        if (!order) { await ctx.reply(`❌ Buyurtma #${orderId} topilmadi.`); return; }

        const statusMap: Record<string, string> = {
            new: '🔵 Yangi', processing: '🟡 Jarayonda', shipping: '🚚 Yo\'lda',
            delivered: '✅ Yetkazildi', cancelled: '🔴 Bekor', draft: '⚪ Qoralama',
        };
        const items = order.items.map((it) =>
            `  • ${it.product?.name || 'Mahsulot'} × ${it.quantity} = ${fmtN(it.price * it.quantity)} so'm`
        ).join('\n');

        await ctx.reply(
            `📦 <b>Buyurtma #${order.id}</b>\n\n` +
            `📊 Status: ${statusMap[order.status] || order.status}\n` +
            `👤 ${order.customerName || '—'} | 📞 ${order.contactPhone || '—'}\n` +
            `📍 ${order.shippingAddress || '—'}\n\n` +
            `<b>Mahsulotlar:</b>\n${items || 'Mahsulotlar yo\'q'}\n\n` +
            `💵 <b>Jami: ${fmtN(order.totalAmount || 0)} so'm</b>\n` +
            `📅 ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`,
            { parse_mode: 'HTML' }
        );
    });

    // ── /shikoyat — Shikoyat qoldirish ──────────────────────────────────
    bot.command('shikoyat', async (ctx) => {
        const tgId = ctx.from.id.toString();

        const reqs = await prisma.recycleRequest.findMany({
            where: { customerTgId: tgId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { point: true },
        });

        if (reqs.length === 0) {
            await ctx.reply('⚠️ Sizda arizalar yo\'q — avval /ariza yuboring.');
            return;
        }

        const buttons = reqs.map(r => [
            btn(`#${r.id} — ${r.point?.regionUz || 'Noma\'lum'} — ${getStatusLabel(r.status)}`, `complaint_${r.id}`)
        ]);
        buttons.push([btn('❌ Bekor qilish', 'complaint_cancel')]);

        await ctx.reply(
            `⚠️ <b>Shikoyat qoldirish</b>\n\n` +
            `Qaysi ariza bo'yicha shikoyat qilmoqchisiz?\nTanlang:`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }
        );
    });

    // ── /help — Barcha buyruqlar ─────────────────────────────────────────
    bot.help((ctx) => {
        ctx.reply(
            `📋 <b>Pack24 Bot — Buyruqlar</b>\n\n` +
            `<b>👤 Mijoz:</b>\n` +
            `/ariza — ♻️ Makulatura topshirish\n` +
            `/arizalarim — Arizalarim holati\n` +
            `/buyurtma — 📦 Buyurtma kuzatish\n` +
            `/narxlar — 💰 Material narxlari\n` +
            `/shikoyat — ⚠️ Shikoyat qoldirish\n\n` +
            `<b>👷 Masul shaxs:</b>\n` +
            `/arizalar — Aktiv arizalar\n` +
            `/haydovchilar — Haydovchilar ro'yxati\n` +
            `/hisobot — Moliyaviy hisobot (30 kun)\n` +
            `/tolash — Kutilayotgan to'lovlar\n\n` +
            `<b>🚚 Haydovchi:</b>\n` +
            `/ishlarim — Tayinlangan ishlar\n` +
            `/status — Online/Offline\n` +
            `/hisobot — Mening hisobotim\n\n` +
            `<b>📱 Boshqa:</b>\n` +
            `/start — Bosh menyu`,
            { parse_mode: 'HTML' }
        );
    });
}
