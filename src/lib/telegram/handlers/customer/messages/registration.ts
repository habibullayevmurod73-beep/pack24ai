import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sessions, getUserByTgId, generateUniqueUserCode, normalizePhone } from '../helpers';
import { Lang, getText, formatText } from '../../../i18n';
import { customerMainKeyboard, sharePhoneKeyboard } from '../../../keyboards';

export function registerRegistrationHandlers(bot: Telegraf) {
    // CONTACT HANDLER
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();
        let ses = sessions.get(tgId);

        if (!ses || !['reg_phone', 'menu'].includes(ses.step)) {
            const existingUser = await getUserByTgId(tgId);
            if (existingUser) {
                const lang: Lang = 'uz';
                sessions.set(tgId, { step: 'menu', lang });
                await ctx.reply(
                    '🏠 Asosiy menyu',
                    { reply_markup: customerMainKeyboard(lang) }
                );
                return;
            }
            const lang: Lang = 'uz';
            ses = { step: 'reg_phone', lang };
            sessions.set(tgId, ses);
        }

        if (ses?.step === 'reg_phone') {
            const phone = normalizePhone(ctx.message.contact.phone_number);
            const lang = ses.lang;

            if (ctx.message.contact.user_id && ctx.message.contact.user_id !== ctx.from.id) {
                await ctx.reply(
                    lang === 'ru' ? '❌ Пожалуйста, отправьте только свой номер телефона.' : '❌ Iltimos, faqat o\'z raqamingizni yuboring.',
                    { reply_markup: sharePhoneKeyboard(lang) }
                );
                return;
            }

            const existing = await prisma.user.findFirst({ where: { phone } });
            if (existing) {
                // Telegram ID ni yangilash (yangi qurilma yoki akkaunt)
                if (existing.telegramId !== tgId) {
                    await prisma.user.update({
                        where: { id: existing.id },
                        data: { telegramId: tgId, telegramVerifiedAt: new Date() },
                    });
                }
                ses.step = 'menu';
                sessions.set(tgId, { ...ses, phone });
                await ctx.reply(
                    formatText('reg_already_exists', lang, {
                        name: existing.name,
                        phone,
                        code: existing.telegramCode || '—',
                    }),
                    { parse_mode: 'HTML', reply_markup: customerMainKeyboard(lang) }
                );
                return;
            }

            // Real otp in production is skipped for speed in current simplified mode
            // Actually, wait, the old code generated OTP and sent it. Let's just create the user directly for simplicity, or we can restore the OTP.
            // Oh, I need to copy the OTP logic precisely to avoid regressions.
            // Let's implement what was there.
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generateOtp
            const expiry = Date.now() + 5 * 60 * 1000; 

            ses.phone = phone;
            ses.step = 'reg_otp';
            ses.otpCode = otp;
            ses.otpExpiry = expiry;
            ses.otpAttempts = 0;
            sessions.set(tgId, ses);

            await ctx.reply(
                lang === 'ru' ? '⏳ Отправляю код подтверждения...' : '⏳ Tasdiqlash kodi yuborilmoqda...',
                { reply_markup: { remove_keyboard: true } }
            );

            await ctx.reply(
                `🔐 <b>${lang === 'ru' ? 'Код подтверждения' : lang === 'en' ? 'Verification Code' : 'Tasdiqlash kodi'}</b>\n\n` +
                `${lang === 'ru' ? 'Ваш код:' : lang === 'en' ? 'Your code:' : 'Sizning kodingiz:'}\n\n` +
                `<code>${otp}</code>\n\n` +
                `${lang === 'ru' ? '⏱ Действует 5 минут' : lang === 'en' ? '⏱ Valid for 5 minutes' : '⏱ 5 daqiqa amal qiladi'}\n\n` +
                `${lang === 'ru' ? '✏️ Введите этот код:' : lang === 'en' ? '✏️ Enter this code:' : '✏️ Ushbu kodni kiriting:'}`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: lang === 'ru' ? '❌ Отмена' : '❌ Bekor qilish', callback_data: 'reg_cancel' },
                        ]],
                    },
                }
            );
        }
    });

    // OTP verification and name registration (text handlers) are in separate modules
}

/**
 * Handle OTP verification step in text handler.
 * Returns true if this handler consumed the message.
 */
export async function handleOtpVerification(ctx: any, tgId: string, text: string): Promise<boolean> {
    const ses = sessions.get(tgId);
    if (ses?.step !== 'reg_otp') return false;

    const lang = ses.lang;
    const input = text.trim();

    if (!/^\d{6}$/.test(input)) {
        await ctx.reply(
            lang === 'ru' ? '❌ Код должен состоять из 6 цифр. Попробуйте ещё раз:' : '❌ Kod 6 raqamdan iborat bo\'lishi kerak. Qayta kiriting:'
        );
        return true;
    }

    if (!ses.otpCode || !ses.otpExpiry || Date.now() > ses.otpExpiry) {
        sessions.delete(tgId);
        await ctx.reply(
            lang === 'ru'
                ? '❌ Код истёк. Нажмите /start и попробуйте снова.'
                : '❌ Kod muddati tugadi. /start ni bosib qayta urinib ko\'ring.',
            { reply_markup: { remove_keyboard: true } }
        );
        return true;
    }

    const attempts = (ses.otpAttempts || 0) + 1;
    if (input !== ses.otpCode) {
        if (attempts >= 5) {
            sessions.delete(tgId);
            await ctx.reply(
                lang === 'ru'
                    ? '❌ Слишком много попыток. Нажмите /start и начните заново.'
                    : '❌ Juda ko\'p noto\'g\'ri urinish. /start ni bosib qayta boshlang.',
                { reply_markup: { remove_keyboard: true } }
            );
            return true;
        }
        ses.otpAttempts = attempts;
        sessions.set(tgId, ses);
        await ctx.reply(
            lang === 'ru'
                ? `❌ Неверный код. Осталось попыток: ${5 - attempts}`
                : `❌ Noto'g'ri kod. Qolgan urinish: ${5 - attempts}`
        );
        return true;
    }

    ses.step = 'reg_name';
    ses.otpCode = undefined;
    ses.otpExpiry = undefined;
    ses.otpAttempts = 0;
    sessions.set(tgId, ses);

    await ctx.reply(
        `✅ <b>${lang === 'ru' ? 'Телефон подтверждён!' : lang === 'en' ? 'Phone verified!' : 'Telefon tasdiqlandi!'}</b>\n\n` +
        getText('reg_ask_name', lang),
        { parse_mode: 'HTML' }
    );
    return true;
}

/**
 * Handle name registration step in text handler.
 * Returns true if this handler consumed the message.
 */
export async function handleNameRegistration(ctx: any, tgId: string, text: string): Promise<boolean> {
    const ses = sessions.get(tgId);
    if (ses?.step !== 'reg_name') return false;

    const name = text.trim();
    const lang = ses.lang;

    // F.I.Sh. kiritish
    if (name.length < 3) {
        await ctx.reply(getText('reg_name_too_short', lang), { parse_mode: 'HTML' });
        return true;
    }

    if (!ses.phone) {
        ses.step = 'reg_phone';
        sessions.set(tgId, ses);
        await ctx.reply(getText('reg_ask_phone', lang), {
            parse_mode: 'HTML',
            reply_markup: sharePhoneKeyboard(lang),
        });
        return true;
    }

    try {
        const code = await generateUniqueUserCode();
        const passwordHash = await bcrypt.hash(code, 10);
        const referralCode = `P${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await prisma.user.create({
            data: {
                name,
                phone: ses.phone,
                passwordHash,
                telegramId: tgId,
                telegramCode: code,
                telegramVerifiedAt: new Date(),
                referralCode,
                role: 'user',
            },
        });

        ses.step = 'menu';
        sessions.set(tgId, { ...ses, name });

        await ctx.reply(
            formatText('reg_code_sent', lang, { name, code, phone: ses.phone }),
            { parse_mode: 'HTML', reply_markup: customerMainKeyboard(lang) }
        );
    } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === 'P2002') {
            await ctx.reply(getText('reg_phone_taken', lang), { parse_mode: 'HTML' });
        } else {
            await ctx.reply(lang === 'uz' ? '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.' : '❌ Ошибка. Попробуйте ещё раз.');
        }
    }
    return true;
}
