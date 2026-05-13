import type { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createBotEvent } from '../botEvents';
import {
    buildDailyJournalMessage, fmtN, humanJournalDate,
    isSkipText, parseJournalDate, parseNumberInput,
    setJournalSession, setMenuSession,
} from '../adminBot.shared';
import { supervisorMainKeyboard } from '../keyboards';
import { advanceJournalAfterDateChosen } from '../adminBot.journalEntry';
import type { Lang } from '../i18n';

interface SupervisorInfo { id: number; name: string; pointId: number | null; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Session = any;

export async function handleExpenseFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    if (ses.stage === 'date') {
        const date = parseJournalDate(text);
        if (!date) { await ctx.reply('❌ Sana noto\'g\'ri. Namuna: `2026-04-01` yoki `bugun`', { parse_mode: 'Markdown' }); return true; }
        await advanceJournalAfterDateChosen(ctx, tgId, lang, sup.id, 'expense', date);
        return true;
    }
    if (ses.stage === 'expense') {
        const expenseAmount = parseNumberInput(text) || 0;
        if (Number.isNaN(expenseAmount) || expenseAmount < 0) { await ctx.reply('❌ Xarajat summasi noto\'g\'ri.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'expense', 'advance', { ...ses, expenseAmount });
        await ctx.reply('💼 Avans summasini kiriting. Agar bo\'lmasa <code>0</code> yozing.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'advance') {
        const advanceAmount = parseNumberInput(text) || 0;
        if (Number.isNaN(advanceAmount) || advanceAmount < 0) { await ctx.reply('❌ Avans summasi noto\'g\'ri.'); return true; }
        if ((ses.expenseAmount || 0) <= 0 && advanceAmount <= 0) {
            await ctx.reply('❌ Kamida xarajat yoki avans summalaridan biri noldan katta bo\'lishi kerak.');
            return true;
        }
        setJournalSession(tgId, lang, sup.id, 'expense', 'comment', { ...ses, advanceAmount });
        await ctx.reply('📝 Komment yozing yoki <code>-</code> yuboring.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'comment') {
        const date = ses.journalDate ? new Date(ses.journalDate) : null;
        if (!date) { setMenuSession(tgId, lang, sup.id); await ctx.reply('❌ Sessiya buzildi. Qaytadan boshlang.'); return true; }
        const comment = isSkipText(text) ? null : text.trim();
        await prisma.recycleExpenseLog.create({
            data: { supervisorId: sup.id, pointId: sup.pointId, date, expenseAmount: ses.expenseAmount || 0, advanceAmount: ses.advanceAmount || 0, comment },
        });
        await createBotEvent({
            sourceBot: 'supervisor', eventType: 'journal.expense.created', entityType: 'recycle_expense_log', severity: 'warning',
            title: 'Xarajat jurnali yozuvi saqlandi',
            message: `${sup.name} xarajat/avans yozuvini saqladi: ${fmtN(Math.round((ses.expenseAmount || 0) + (ses.advanceAmount || 0)))} so'm.`,
            supervisorId: sup.id, pointId: sup.pointId ?? undefined,
            payload: { date: date.toISOString(), expenseAmount: ses.expenseAmount || 0, advanceAmount: ses.advanceAmount || 0, comment },
        });
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply(
            `✅ <b>Xarajat yozuvi saqlandi</b>\n\n` +
            `📅 ${humanJournalDate(date)}\n` +
            `💸 Xarajat: <b>${fmtN(Math.round(ses.expenseAmount || 0))} so'm</b>\n` +
            `💼 Avans: <b>${fmtN(Math.round(ses.advanceAmount || 0))} so'm</b>\n` +
            `${comment ? `📝 ${comment}\n\n` : '\n'}` +
            await buildDailyJournalMessage(sup.id, date),
            { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
        );
        return true;
    }
    return false;
}
