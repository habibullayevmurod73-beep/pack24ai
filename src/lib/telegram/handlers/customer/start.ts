import { Telegraf } from 'telegraf';
import { sessions, getUserByTgId } from './helpers';
import { Lang, getText, formatText } from '../../i18n';
import { cabinetMenuKeyboard, customerMainKeyboard, langSelectKeyboard } from '../../keyboards';
import type { CustomerSession } from './types';

export function registerStartHandler(bot: Telegraf) {
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();

        // 1. Telegram ID bilan ro'yxatdan o'tgan foydalanuvchi
        const user = await getUserByTgId(tgId);
        if (user) {
            const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;
            sessions.set(tgId, { step: 'menu', lang });
            await ctx.reply(
                formatText('cabinet_menu', lang, {
                    name: user.name,
                    phone: user.phone,
                    points: String(user.ecoPoints),
                }),
                { parse_mode: 'HTML', reply_markup: cabinetMenuKeyboard(lang) }
            );
            await ctx.reply(
                lang === 'uz' ? '⬇️ Yoki quyidagi xizmatlardan foydalaning:' :
                lang === 'ru' ? '⬇️ Или воспользуйтесь услугами:' :
                '⬇️ Or use our services below:',
                { reply_markup: customerMainKeyboard(lang) }
            );
            return;
        }

        // 2. Yangi foydalanuvchi — til tanlash
        sessions.set(tgId, { step: 'lang', lang: 'uz' });
        await ctx.reply(
            getText('welcome', 'uz'),
            { parse_mode: 'HTML', reply_markup: langSelectKeyboard() }
        );
    });
}
