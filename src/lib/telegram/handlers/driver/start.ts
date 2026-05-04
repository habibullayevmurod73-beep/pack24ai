import { Telegraf } from 'telegraf';
import { getDriver, sessions } from './helpers';
import { Lang, getText, formatText } from '../../i18n';
import { driverMainKeyboard, driverSharePhoneKeyboard } from '../../keyboards';

export function registerStartHandler(bot: Telegraf) {
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await getDriver(tgId);

        if (driver) {
            const lang: Lang = 'uz';
            await ctx.reply(
                formatText('drv_registered', lang, { name: driver.name }),
                { parse_mode: 'HTML', reply_markup: driverMainKeyboard(driver.isOnline, lang) }
            );
            return;
        }

        // Yangi foydalanuvchi — telefon so'rash
        sessions.set(tgId, { step: 'phone', lang: 'uz' });
        await ctx.reply(getText('drv_welcome', 'uz'), {
            parse_mode: 'HTML',
            reply_markup: driverSharePhoneKeyboard(),
        });
    });

    bot.help(async (ctx) => {
        await ctx.reply(
            '🚚 <b>Pack24 — Haydovchi boti</b>\n\n' +
            '📋 Topshiriqlar — tayinlangan arizalar\n' +
            '✅ Qabul / ❌ Rad — qabul yoki rad qilish\n' +
            '🚚 Yo\'lga chiqdim — harakat boshlanishi\n' +
            '📍 Yetib keldim — yetib kelganingiz\n' +
            '⚖️ Kalkulyator — og\'irlik hisob-kitobi\n' +
            '📊 Kunlik hisobot — bugungi natijalar\n\n' +
            '/start — Bosh menyu',
            { parse_mode: 'HTML' }
        );
    });
}
