import { Telegraf } from 'telegraf';
import { Lang, formatText, getText } from './i18n';
import { adminSessions, getSupervisor } from './adminBot.shared';
import {
    supervisorMainKeyboard,
    supervisorSharePhoneKeyboard,
} from './keyboards';
import { registerAdminCallbackHandler } from './adminBot.callback';
import { registerAdminContactHandler } from './adminBot.contact';
import { registerAdminTextHandler } from './adminBot.text';

let adminBotInstance: Telegraf | null = null;

export async function initAdminBot(): Promise<Telegraf | null> {
    if (adminBotInstance) return adminBotInstance;

    const token = process.env.ADMIN_BOT_TOKEN;
    if (!token) {
        console.warn('[AdminBot] ADMIN_BOT_TOKEN topilmadi');
        return null;
    }

    const bot = new Telegraf(token);

    await bot.telegram.setMyCommands([
        { command: 'start', description: '🏠 Bosh menyu / Главное меню / Main menu' },
        { command: 'help', description: '❓ Yordam / Помощь / Help' },
    ]).catch(() => {});

    bot.use(async (ctx, next) => {
        const startedAt = Date.now();
        await next();
        console.log(`[AdminBot] ${ctx.updateType} in ${Date.now() - startedAt}ms`);
    });

    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const supervisor = await getSupervisor(tgId);

        if (supervisor) {
            const lang: Lang = 'uz';
            await ctx.reply(
                formatText('adm_registered', lang, {
                    name: supervisor.name,
                    point: supervisor.point?.regionUz || '—',
                }),
                { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
            );
            return;
        }

        adminSessions.set(tgId, { step: 'phone', lang: 'uz' });
        await ctx.reply(getText('adm_welcome', 'uz'), {
            parse_mode: 'HTML',
            reply_markup: supervisorSharePhoneKeyboard(),
        });
    });

    bot.help(async (ctx) => {
        await ctx.reply(
            '👷 <b>Pack24 — Masul boti</b>\n\n' +
            '📋 Arizalar — yangi va jarayondagi arizalar\n' +
            '🚚 Haydovchi tayinlash — ariza uchun haydovchi tanlash\n' +
            '💰 To\'lovlar — hisob-kitob tasdiqlash\n' +
            '🏭 Punkt boshqarish — ochiq/yopiq almashtirish\n' +
            '📥 Qabul — makulatura qabul jurnaliga yozuv qo\'shish\n' +
            '🏭 Press — press/toy ishlab chiqarish jurnaliga yozuv qo\'shish\n' +
            '💸 Xarajat — ish haqi va boshqa xarajatlarni kiritish\n' +
            '💼 Kassa — kunlik kassa ochilishini saqlash\n' +
            '🚛 Sotuv — preslangan makulatura sotuvini kiritish\n' +
            '📊 Hisobotlar — kunlik/haftalik/oylik statistika\n\n' +
            '/start — Bosh menyu',
            { parse_mode: 'HTML' }
        );
    });

    registerAdminCallbackHandler(bot);
    registerAdminContactHandler(bot);
    registerAdminTextHandler(bot);

    adminBotInstance = bot;
    return bot;
}
