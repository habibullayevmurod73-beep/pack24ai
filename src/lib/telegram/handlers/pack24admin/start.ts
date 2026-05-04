import { Telegraf } from 'telegraf';
import { getAccessIdentity, touchDbAdmin, sessions, replyWithMenu } from './helpers';
import { pack24AdminSharePhoneKeyboard } from '../../keyboards';

export function registerStartHandler(bot: Telegraf) {
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const hqAdmin = await getAccessIdentity(tgId);

        if (hqAdmin) {
            await touchDbAdmin(hqAdmin);
            sessions.set(tgId, { step: 'menu' });
            await replyWithMenu(ctx, hqAdmin.name);
            return;
        }

        sessions.set(tgId, { step: 'phone' });
        await ctx.reply(
            '🔐 <b>Pack24 HQ admin bot</b>\n\nTelefon raqamingizni ulashing. Tizim sizni ro\'yxatdan o\'tgan HQ admin sifatida tekshiradi.',
            {
                parse_mode: 'HTML',
                reply_markup: pack24AdminSharePhoneKeyboard(),
            },
        );
    });

    bot.help(async (ctx) => {
        await ctx.reply(
            '🏢 <b>Pack24 HQ Admin Bot</b>\n\n' +
            '👷 Masullar — masul shaxslarni boshqarish\n' +
            '🚚 Haydovchilar — haydovchilarni boshqarish\n' +
            '📋 Jurnal tahrirlari — masul so\'rovlari (tasdiq/rad)\n' +
            '📡 Hodisalar — oxirgi platforma eventlari\n' +
            '🚨 Ogohlantirishlar — yangi va muhim eventlar\n' +
            '📊 Statistika — 24 soatlik qisqa kesim\n' +
            '✅ Barchasini o\'qildi — event feedni tozalash\n' +
            '👤 Profil — admin ma\'lumotlari\n\n' +
            '/start — bosh menyu',
            { parse_mode: 'HTML' },
        );
    });
}
