import type { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createBotEvent } from '../botEvents';
import {
    buildDailyJournalMessage, fmtN, humanJournalDate,
    parseJournalDate, parseNumberInput,
    setMenuSession,
} from '../adminBot.shared';
import { supervisorMainKeyboard } from '../keyboards';
import { advanceJournalAfterDateChosen } from '../adminBot.journalEntry';
import type { Lang } from '../i18n';

interface SupervisorInfo { id: number; name: string; pointId: number | null; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Session = any;

export async function handleCashFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    if (ses.stage === 'date') {
        const date = parseJournalDate(text);
        if (!date) { await ctx.reply('❌ Sana noto\'g\'ri. Namuna: `2026-04-01` yoki `bugun`', { parse_mode: 'Markdown' }); return true; }
        await advanceJournalAfterDateChosen(ctx, tgId, lang, sup.id, 'cash', date);
        return true;
    }
    if (ses.stage === 'openingBalance') {
        const openingBalance = parseNumberInput(text);
        const date = ses.journalDate ? new Date(ses.journalDate) : null;
        if (!date || Number.isNaN(openingBalance) || openingBalance < 0) {
            await ctx.reply('❌ Kassa summasi noto\'g\'ri.');
            return true;
        }
        const from = new Date(date); from.setHours(0, 0, 0, 0);
        const to = new Date(from); to.setDate(to.getDate() + 1);
        const existingCash = await prisma.recycleDailyCash.findFirst({
            where: { supervisorId: sup.id, date: { gte: from, lt: to } },
        });
        let cashEventType = 'journal.cash.created';
        if (existingCash) {
            await prisma.recycleDailyCash.update({ where: { id: existingCash.id }, data: { openingBalance } });
            cashEventType = 'journal.cash.updated';
        } else {
            await prisma.recycleDailyCash.create({
                data: { supervisorId: sup.id, pointId: sup.pointId, date, openingBalance },
            });
        }
        await createBotEvent({
            sourceBot: 'supervisor', eventType: cashEventType, entityType: 'recycle_daily_cash',
            title: 'Kunlik kassa yozuvi saqlandi',
            message: `${sup.name} ${fmtN(Math.round(openingBalance))} so'm boshlang'ich kassani saqladi.`,
            supervisorId: sup.id, pointId: sup.pointId ?? undefined,
            payload: { date: date.toISOString(), openingBalance },
        });
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply(
            `✅ <b>Kassa saqlandi</b>\n\n` +
            `📅 ${humanJournalDate(date)}\n🏦 Boshlang'ich kassa: <b>${fmtN(Math.round(openingBalance))} so'm</b>\n\n` +
            await buildDailyJournalMessage(sup.id, date),
            { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
        );
        return true;
    }
    return false;
}
