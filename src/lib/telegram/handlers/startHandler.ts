// ═══════════════════════════════════════════════════════════════════════════════
// /start — Rolni aniqlash va salomlash
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { btn, getStatusLabel } from '../constants';
import { customerKeyboard, supervisorKeyboard, driverKeyboard } from '../keyboards';

export function registerStartHandler(bot: Telegraf) {
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const name = ctx.from.first_name || 'Foydalanuvchi';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz';
        const config = await prisma.telegramConfig.findFirst();

        // ── MASUL SHAXS ──
        const supervisor = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (supervisor) {
            const activeCount = await prisma.recycleRequest.count({
                where: { supervisorId: supervisor.id, status: { in: ['dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] } }
            });
            await ctx.reply(
                `👷 Salom, <b>${supervisor.name}</b>!\n\n` +
                `Siz <b>masul shaxs</b> sifatida tizimga ulangansiz.\n\n` +
                `📋 Aktiv arizalar: <b>${activeCount}</b>\n\n` +
                `Quyidagi tugmalar orqali boshqaring 👇`,
                { parse_mode: 'HTML', reply_markup: supervisorKeyboard() }
            );
            return;
        }

        // ── HAYDOVCHI ──
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) {
            await prisma.driver.update({ where: { id: driver.id }, data: { isOnline: true, lastSeenAt: new Date() } });
            const jobCount = await prisma.recycleRequest.count({
                where: { assignedDriverId: driver.id, status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] } }
            });
            await ctx.reply(
                `🚚 Salom, <b>${driver.name}</b>!\n\n` +
                `Holat: 🟢 <b>Online</b>\n` +
                `📋 Aktiv ishlar: <b>${jobCount}</b>\n\n` +
                `Quyidagi tugmalar orqali boshqaring 👇`,
                { parse_mode: 'HTML', reply_markup: driverKeyboard() }
            );
            return;
        }

        // ── MIJOZ (mavjud) ──
        const existing = await prisma.recycleRequest.findFirst({ where: { customerTgId: tgId }, orderBy: { createdAt: 'desc' } });
        if (existing) {
            await ctx.reply(
                `♻️ Salom, <b>${name}</b>!\n\n` +
                `Oxirgi ariza: <b>#${existing.id}</b> — ${getStatusLabel(existing.status)}\n\n` +
                `Quyidagi tugmalar orqali foydalaning 👇`,
                { parse_mode: 'HTML', reply_markup: customerKeyboard('uz', appUrl) }
            );
            return;
        }

        // ── YANGI FOYDALANUVCHI ──
        await ctx.reply(
            `🏭 <b>Pack24 — Qadoqlash Yechimlari</b>\n\n` +
            `Salom, <b>${name}</b>! tizimga xush kelibsiz.`,
            { parse_mode: 'HTML', reply_markup: customerKeyboard('uz', appUrl) }
        );

        await ctx.reply(
            `Sizga qanday yordam bera olamiz?\n` +
            `📦 Qadoqlash mahsulotlarini buyurtma qiling\n` +
            `♻️ Makulaturani topshirib pul ishlang\n\n` +
            `👇 Yoki xodim bo'lsangiz, kod bilan kiring:`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn('🔑 Kod bilan kirish (haydovchi/masul)', 'register_code')],
                    ],
                },
            }
        );
    });
}
