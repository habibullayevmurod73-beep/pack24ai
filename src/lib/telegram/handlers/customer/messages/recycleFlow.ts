import { Telegraf } from 'telegraf';
import { sessions, getUserLang } from '../helpers';
import { getText } from '../../../i18n';
import { btn, customerMainKeyboard, recycleMethodKeyboard } from '../../../keyboards';
import { submitTruckRequest } from '../truckRequest';

export function registerRecycleFlowHandlers(bot: Telegraf) {
    // LOCATION HANDLER
    bot.on('location', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const ses = sessions.get(tgId);
        if (!ses || ses.step !== 'location') return;

        ses.lat = ctx.message.location.latitude;
        ses.lng = ctx.message.location.longitude;
        ses.step = 'choose_method';
        const lang = ses.lang;

        await ctx.reply(
            getText('recycle_choose', lang),
            { parse_mode: 'HTML', reply_markup: recycleMethodKeyboard(lang) }
        );
    });

    // PHOTO HANDLER
    bot.on('photo', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const ses = sessions.get(tgId);
        if (!ses || ses.step !== 'photo') return;

        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const fileLink = await bot.telegram.getFileLink(photo.file_id);

        await submitTruckRequest(ctx, bot, ses, tgId, fileLink.href);
    });
}

/**
 * Handle text fallback for location step.
 * Returns true if this handler consumed the message.
 */
export async function handleLocationTextFallback(ctx: any, tgId: string, text: string): Promise<boolean> {
    const ses = sessions.get(tgId);
    if (ses?.step !== 'location' || text.startsWith('/')) return false;

    const lang = await getUserLang(tgId);
    const l = ses.lang;
    if (text === getText('cancel', l) || text === getText('cancel', 'uz') || text === getText('cancel', 'ru') || text === getText('cancel', 'en')) {
        ses.step = 'menu';
        await ctx.reply(
            lang === 'uz' ? '❌ Bekor qilindi. Asosiy menyu:' : lang === 'ru' ? '❌ Отменено. Главное меню:' : '❌ Cancelled. Main menu:',
            { reply_markup: customerMainKeyboard(lang) }
        );
        return true;
    }

    ses.lat = 0;
    ses.lng = 0;
    ses.step = 'choose_method';

    await ctx.reply(
        getText('recycle_choose', l),
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [btn(getText('btn_self_delivery', l), 'recycle_self')],
                    [btn(getText('btn_call_truck', l), 'recycle_truck')],
                    [btn(getText('cancel', l), 'recycle_cancel')],
                ],
            },
        }
    );
    return true;
}
