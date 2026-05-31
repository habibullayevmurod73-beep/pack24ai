import { Telegraf } from 'telegraf';
import { Lang } from '../../i18n';
import { handleJournalCorrectionText } from './journalCorrection';
import {
    authenticateAndPrepare,
    handleMenuReset,
    handleHelp,
    handleJournalCancel,
    handleJournalFlowText,
    handleListHandlers,
    handleJournalButtons,
    handleReportButton,
} from './text/index';

export function registerAdminTextHandler(bot: Telegraf) {
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (text.startsWith('/')) return;

        const sup = await authenticateAndPrepare(ctx, tgId, text);
        if (!sup) return;

        const lang: Lang = 'uz';

        handleMenuReset(tgId, text, lang, sup.id);

        if (await handleJournalCorrectionText(ctx, tgId, text, sup, lang)) return;

        if (await handleHelp(ctx, text)) return;

        if (await handleJournalCancel(ctx, tgId, text, lang, sup.id)) return;
        if (await handleJournalFlowText(ctx, tgId, text, sup, lang)) return;

        if (await handleListHandlers(ctx, text, sup, lang)) return;
        if (await handleJournalButtons(ctx, text, tgId, sup, lang)) return;
        if (await handleReportButton(ctx, text, lang)) return;
    });
}
