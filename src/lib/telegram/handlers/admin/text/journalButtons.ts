import { Context } from 'telegraf';
import { Lang } from '../../../i18n';
import { setJournalSession } from '../../../adminBot.shared';
import { journalEntryDateKeyboard } from '../../../adminBot.journalEntry';

export async function handleJournalButtons(
    ctx: Context,
    text: string,
    tgId: string,
    sup: { id: number },
    lang: Lang,
): Promise<boolean> {
    if (text === '📥 Qabul') {
        setJournalSession(tgId, lang, sup.id, 'intake', 'date');
        await ctx.reply(
            `📥 <b>Makulatura qabul jurnaliga yozuv</b>\n\n` +
            `1-qadam: <b>sanani tanlang</b> yoki matn bilan yuboring.\n` +
            `<i>Masalan:</i> <code>bugun</code>, <code>kecha</code>, <code>2026-05-01</code>\n\n` +
            `<i>Bekor:</i> <code>cancel</code>`,
            { parse_mode: 'HTML', reply_markup: journalEntryDateKeyboard('intake') }
        );
        return true;
    }

    if (text === '🏭 Press') {
        setJournalSession(tgId, lang, sup.id, 'press', 'date');
        await ctx.reply(
            `🏭 <b>Press / toy jurnali</b>\n\n` +
            `1-qadam: <b>sanani tanlang</b> yoki matn bilan yuboring.\n\n` +
            `<i>Bekor:</i> <code>cancel</code>`,
            { parse_mode: 'HTML', reply_markup: journalEntryDateKeyboard('press') }
        );
        return true;
    }

    if (text === '💸 Xarajat') {
        setJournalSession(tgId, lang, sup.id, 'expense', 'date');
        await ctx.reply(
            `💸 <b>Ish haqi va xarajatlar</b>\n\n` +
            `1-qadam: <b>sanani tanlang</b> yoki matn bilan yuboring.\n\n` +
            `<i>Bekor:</i> <code>cancel</code>`,
            { parse_mode: 'HTML', reply_markup: journalEntryDateKeyboard('expense') }
        );
        return true;
    }

    if (text === '💼 Kassa') {
        setJournalSession(tgId, lang, sup.id, 'cash', 'date');
        await ctx.reply(
            `💼 <b>Kunlik kassa ochilishi</b>\n\n` +
            `1-qadam: <b>sanani tanlang</b> yoki matn bilan yuboring.\n\n` +
            `<i>Bekor:</i> <code>cancel</code>`,
            { parse_mode: 'HTML', reply_markup: journalEntryDateKeyboard('cash') }
        );
        return true;
    }

    if (text === '🚛 Sotuv') {
        setJournalSession(tgId, lang, sup.id, 'sale', 'date');
        await ctx.reply(
            `🚛 <b>Preslangan makulatura sotuv jurnali</b>\n\n` +
            `1-qadam: <b>sanani tanlang</b> yoki matn bilan yuboring.\n\n` +
            `<i>Bekor:</i> <code>cancel</code>`,
            { parse_mode: 'HTML', reply_markup: journalEntryDateKeyboard('sale') }
        );
        return true;
    }

    return false;
}
