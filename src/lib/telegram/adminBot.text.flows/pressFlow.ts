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

export async function handlePressFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    if (ses.stage === 'date') {
        const date = parseJournalDate(text);
        if (!date) { await ctx.reply('❌ Sana noto\'g\'ri. Namuna: `2026-04-01` yoki `bugun`', { parse_mode: 'Markdown' }); return true; }
        await advanceJournalAfterDateChosen(ctx, tgId, lang, sup.id, 'press', date);
        return true;
    }
    if (ses.stage === 'weight') {
        const pressedKg = parseNumberInput(text);
        if (Number.isNaN(pressedKg) || pressedKg <= 0) { await ctx.reply('❌ Kg noto\'g\'ri. Musbat son kiriting.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'press', 'bales', { ...ses, weightKg: pressedKg });
        await ctx.reply('📦 Toylar sonini kiriting.');
        return true;
    }
    if (ses.stage === 'bales') {
        const baleCount = parseInt(text.replace(/\s/g, ''), 10);
        if (Number.isNaN(baleCount) || baleCount <= 0) { await ctx.reply('❌ Toylar soni noto\'g\'ri.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'press', 'operators', { ...ses, baleCount });
        await ctx.reply('👷 Bajaruvchilarni yozing yoki <code>-</code> yuboring.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'operators') {
        const date = ses.journalDate ? new Date(ses.journalDate) : null;
        if (!date || !ses.weightKg || !ses.baleCount) { setMenuSession(tgId, lang, sup.id); await ctx.reply('❌ Sessiya buzildi. Qaytadan boshlang.'); return true; }
        const operators = isSkipText(text) ? null : text.trim();
        await prisma.recyclePressLog.create({
            data: { supervisorId: sup.id, pointId: sup.pointId, date, pressedKg: ses.weightKg, baleCount: ses.baleCount, operators },
        });
        await createBotEvent({
            sourceBot: 'supervisor', eventType: 'journal.press.created', entityType: 'recycle_press_log', severity: 'success',
            title: 'Press jurnali yozuvi saqlandi',
            message: `${sup.name} ${fmtN(Math.round(ses.weightKg))} kg press yozuvini saqladi.`,
            supervisorId: sup.id, pointId: sup.pointId ?? undefined,
            payload: { date: date.toISOString(), pressedKg: ses.weightKg, baleCount: ses.baleCount, operators },
        });
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply(
            `✅ <b>Press yozuvi saqlandi</b>\n\n` +
            `📅 ${humanJournalDate(date)}\n⚖️ ${fmtN(Math.round(ses.weightKg))} kg\n` +
            `📦 Toylar: <b>${fmtN(ses.baleCount)}</b>\n` +
            `${operators ? `👷 ${operators}\n\n` : '\n'}` +
            await buildDailyJournalMessage(sup.id, date),
            { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
        );
        return true;
    }
    return false;
}
