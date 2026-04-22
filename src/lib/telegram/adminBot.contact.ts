import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { formatText, getText } from './i18n';
import { supervisorMainKeyboard, supervisorSharePhoneKeyboard } from './keyboards';
import {
    adminSessions,
    generateUniqueSupCode,
} from './adminBot.shared';

export function registerAdminContactHandler(bot: Telegraf) {
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();

        if (ctx.message.contact.user_id && ctx.message.contact.user_id !== ctx.from.id) {
            await ctx.reply('❌ Iltimos, faqat o\'z telefon raqamingizni ulashing.', {
                reply_markup: supervisorSharePhoneKeyboard(),
            });
            return;
        }

        let phone = ctx.message.contact.phone_number.replace(/[^0-9+]/g, '');
        if (!phone.startsWith('+')) phone = `+${phone}`;

        try {
            const supervisor = await prisma.supervisor.findFirst({
                where: {
                    OR: [
                        { phone },
                        { phone: phone.replace('+', '') },
                        { phone: phone.replace('+998', '0') },
                        { phone: phone.slice(-9) },
                    ],
                },
                include: { point: true },
            });

            if (!supervisor) {
                await ctx.reply(
                    `❌ <b>Raqamingiz tizimda topilmadi!</b>\n\n` +
                    `📱 Telefon: <code>${phone}</code>\n\n` +
                    `Bu bot faqat <b>ro'yxatdan o'tgan masul xodimlar</b> uchun.\n\n` +
                    `📋 Masul xodim bo'lish uchun:\n` +
                    `1️⃣ Pack24 bosh administratori sizni tizimga qo'shishi kerak\n` +
                    `2️⃣ Keyin qaytib kelib /start bosing\n\n` +
                    `👤 Oddiy foydalanuvchi sifatida ro'yxatdan o'tmoqchimisiz?\n` +
                    `▶️ <a href="https://t.me/Pack24AI_bot">@Pack24AI_bot</a> botiga o'ting\n\n` +
                    `📞 Bog'lanish: <a href="tel:+998880557888">+998 88 055-78-88</a>`,
                    { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }
                );
                adminSessions.delete(tgId);
                return;
            }

            if (supervisor.telegramId && supervisor.telegramId !== tgId) {
                await ctx.reply(getText('adm_already_registered', 'uz'), {
                    parse_mode: 'HTML',
                    reply_markup: { remove_keyboard: true },
                });
                return;
            }

            const code = await generateUniqueSupCode();

            await prisma.supervisor.update({
                where: { id: supervisor.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from.username || ctx.from.first_name || null,
                    registeredAt: new Date(),
                    registrationCode: code,
                },
            });

            adminSessions.delete(tgId);

            await ctx.reply(
                formatText('adm_code_sent', 'uz', {
                    name: supervisor.name,
                    point: supervisor.point?.regionUz || '—',
                    code,
                }),
                {
                    parse_mode: 'HTML',
                    reply_markup: supervisorMainKeyboard(),
                }
            );

            try {
                const config = await prisma.telegramConfig.findFirst();
                if (config?.salesChatId) {
                    const adminBot = await import('./botManager').then((module) => module.getAdminBot());
                    if (adminBot) {
                        const chatIds = config.salesChatId.split(',').map((value) => value.trim()).filter(Boolean);
                        for (const chatId of chatIds) {
                            await adminBot.telegram.sendMessage(
                                chatId,
                                `🆕 <b>Masul shaxs ro'yxatdan o'tdi!</b>\n\n` +
                                `👤 ${supervisor.name}\n` +
                                `📞 ${supervisor.phone}\n` +
                                `🏭 Punkt: ${supervisor.point?.regionUz || '—'}\n` +
                                `🔑 Verifikatsion kod: <code>${code}</code>\n` +
                                `🕐 ${new Date().toLocaleString('ru-RU')}`,
                                { parse_mode: 'HTML' }
                            );
                        }
                    }
                }
            } catch {
                // salesChatId sozlanmagan bo'lishi mumkin
            }

            console.log(`[AdminBot] ✅ Masul ro'yxatdan o'tdi: ${supervisor.name} | Kod: ${code}`);
        } catch (err) {
            console.error('[AdminBot] Contact handler xatolik:', err);
            await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', {
                reply_markup: { remove_keyboard: true },
            });
        }
    });
}
