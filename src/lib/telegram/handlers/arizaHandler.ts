// ═══════════════════════════════════════════════════════════════════════════════
// Ariza (recycling request) flow — /ariza buyrug'i va session boshqaruv
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { MAT, btn, getStatusLabel } from '../constants';
import { arizaSessions } from '../sessions';
import { customerKeyboard } from '../keyboards';

/** Ariza flow ni boshlash */
export async function startArizaFlow(ctx: Context) {
    const tgId = ctx.from!.id.toString();
    const name = ctx.from!.first_name || '';

    // Agar allaqachon driver yoki supervisor bo'lsa — chiqish
    const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
    if (driver) { await ctx.reply('🚚 Siz haydovchisiz — /ishlarim buyrug\'ini ishlating.'); return; }
    const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
    if (sup) { await ctx.reply('👷 Siz masulsiz — /arizalar buyrug\'ini ishlating.'); return; }

    // Session boshlanishi — ism so'rash
    arizaSessions.set(tgId, { step: 'name', name });
    await ctx.reply(
        `♻️ <b>Yangi ariza yuborish</b>\n\n` +
        `Iltimos, Ismingiz va Familiyangizni (F.I.SH.) kiriting:`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [btn(`📝 ${name}`, `ariza_usename`)],
                    [btn('❌ Bekor qilish', 'ariza_cancel')],
                ],
            },
        }
    );
}

/** Ariza yaratish — sessiyadan DB ga saqlash */
export async function createArizaFromSession(
    ctx: Context,
    tgId: string,
    pickupType: string,
    address: string | null,
    botInstance: Telegraf
) {
    const ses = arizaSessions.get(tgId);
    if (!ses || !ses.name || !ses.phone || !ses.regionId) {
        arizaSessions.delete(tgId);
        await ctx.reply('❌ Sessiya tugagan. Qayta /ariza yuboring.');
        return;
    }

    try {
        const point = await prisma.recyclePoint.findUnique({ where: { id: ses.regionId } });
        const matInfo = MAT[ses.material || 'mix'] || MAT.mix;

        const request = await prisma.recycleRequest.create({
            data: {
                name: ses.name,
                phone: ses.phone,
                regionId: ses.regionId,
                material: ses.material || 'mix',
                volume: ses.volume || null,
                pickupType,
                address: address || null,
                customerTgId: tgId,
                status: 'new',
            },
        });

        arizaSessions.delete(tgId);

        await ctx.reply(
            `✅ <b>Ariza yuborildi! #${request.id}</b>\n\n` +
            `👤 ${ses.name} | 📞 ${ses.phone}\n` +
            `📍 ${point?.regionUz || '—'}, ${point?.cityUz || '—'}\n` +
            `${matInfo.emoji} ${matInfo.label}` +
            `${ses.volume ? ` | ⚖️ ~${ses.volume} kg` : ''}\n` +
            `🏠 ${pickupType === 'pickup' ? `Pickup: ${address}` : "O'zi olib boradi"}\n\n` +
            `⏳ Tez orada masul shaxs siz bilan bog'lanadi!\n` +
            `Holat: /arizalarim`,
            { parse_mode: 'HTML' }
        );

        // ── Masul shaxslarga xabar ────────────────────────────────────────
        const supervisors = await prisma.supervisor.findMany({
            where: { pointId: ses.regionId, isActive: true },
        });
        for (const sup of supervisors) {
            if (sup.telegramId) {
                try {
                    await botInstance.telegram.sendMessage(sup.telegramId,
                        `📬 <b>Yangi ariza! #${request.id}</b>\n\n` +
                        `👤 ${ses.name} | 📞 ${ses.phone}\n` +
                        `📍 ${point?.regionUz || '—'}\n` +
                        `${matInfo.emoji} ${matInfo.label}` +
                        `${ses.volume ? ` | ⚖️ ~${ses.volume} kg` : ''}\n` +
                        `🏠 ${pickupType === 'pickup' ? `Pickup: ${address}` : "O'zi keladi"}\n\n` +
                        `Haydovchi tayinlash uchun /arizalar`,
                        { parse_mode: 'HTML' }
                    );
                } catch (e) {
                    console.error(`Supervisorga xabar yuborishda xato (${sup.id}):`, e);
                }
            }
        }

        // ── Admin guruhga xabar ───────────────────────────────────────────
        const config = await prisma.telegramConfig.findFirst();
        if (config?.salesChatId) {
            const chatIds = config.salesChatId.split(',').map(id => id.trim());
            for (const chatId of chatIds) {
                if (chatId) {
                    try {
                        await botInstance.telegram.sendMessage(chatId,
                            `📬 <b>Yangi ariza! #${request.id}</b>\n👤 ${ses.name} | 📞 ${ses.phone}\n📍 ${point?.regionUz || '—'}\n${matInfo.emoji} ${matInfo.label}`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (e) {
                        console.error(`Admin chatga xabar yuborishda xato (${chatId}):`, e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Ariza yaratishda xato:', error);
        arizaSessions.delete(tgId);
        await ctx.reply('❌ Ariza yaratishda xatolik yuz berdi. Qayta /ariza yuboring.');
    }
}

/** /ariza buyrug'i va ♻️ tugmasini ro'yxatdan o'tkazish */
export function registerArizaHandler(bot: Telegraf) {
    bot.command('ariza', startArizaFlow);
}

// Re-export — boshqa handlerlar uchun
export { getStatusLabel };
