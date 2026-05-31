import { Telegraf } from 'telegraf';
import { Lang } from '../../i18n';
import { getSupervisor } from '../../adminBot.shared';
import { tryHandleJournalDateCallback } from '../../adminBot.journalEntry';
import { tryJournalCorrectionCallback } from './journalCorrection';
import {
    handleDriverAccessCallbacks,
    handleDriverAssignmentCallbacks,
    handlePaymentCallbacks,
    handleOperationsCallbacks,
} from './callbacks/index';

export function registerAdminCallbackHandler(bot: Telegraf) {
    bot.on('callback_query', async (ctx) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return;

        const tgId = ctx.from.id.toString();

        try {
            const sup = await getSupervisor(tgId);
            if (!sup) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
                return;
            }

            const lang: Lang = 'uz';
            if (await tryHandleJournalDateCallback(ctx, data, sup, tgId, lang)) return;
            if (await tryJournalCorrectionCallback(ctx, data, sup, tgId, lang)) return;

            if (await handleDriverAccessCallbacks(ctx, data, sup)) return;
            if (await handleDriverAssignmentCallbacks(ctx, data, sup)) return;
            if (await handlePaymentCallbacks(ctx, data, sup)) return;
            if (await handleOperationsCallbacks(ctx, data, sup)) return;
        } catch (err) {
            console.error('[AdminBot] Callback error:', err);
            await ctx.answerCbQuery('❌ Xatolik').catch(() => {});
        }
    });
}
