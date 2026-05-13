import type { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createBotEvent } from '../botEvents';
import {
    buildDailyJournalMessage,
    fmtN,
    humanJournalDate,
    isSkipText,
    parseJournalDate,
    parseNumberInput,
    setJournalSession,
    setMenuSession,
} from '../adminBot.shared';
import { supervisorMainKeyboard } from '../keyboards';
import { advanceJournalAfterDateChosen } from '../adminBot.journalEntry';
import type { Lang } from '../i18n';

interface SupervisorInfo {
    id: number;
    name: string;
    pointId: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Session = any;

export async function handleIntakeFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    if (ses.stage === 'date') {
        const date = parseJournalDate(text);
        if (!date) {
            await ctx.reply('❌ Sana noto\'g\'ri. Namuna: `2026-04-01` yoki `bugun`', { parse_mode: 'Markdown' });
            return true;
        }
        await advanceJournalAfterDateChosen(ctx, tgId, lang, sup.id, 'intake', date);
        return true;
    }
    if (ses.stage === 'weight') {
        const weightKg = parseNumberInput(text);
        if (Number.isNaN(weightKg) || weightKg <= 0) {
            await ctx.reply('❌ Kg noto\'g\'ri. Musbat son kiriting.');
            return true;
        }
        setJournalSession(tgId, lang, sup.id, 'intake', 'price', { ...ses, weightKg });
        await ctx.reply(`💵 1 kg narxini kiriting.\n\nMasalan: <code>2000</code>`, { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'price') {
        const pricePerKg = parseNumberInput(text);
        if (Number.isNaN(pricePerKg) || pricePerKg <= 0) {
            await ctx.reply('❌ Narx noto\'g\'ri. Musbat son kiriting.');
            return true;
        }
        setJournalSession(tgId, lang, sup.id, 'intake', 'note', { ...ses, pricePerKg });
        await ctx.reply(`📝 Izoh yuboring yoki <code>-</code> yozing.`, { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'note') {
        const date = ses.journalDate ? new Date(ses.journalDate) : null;
        const note = isSkipText(text) ? null : text.trim();
        if (!date || !ses.weightKg || !ses.pricePerKg) {
            setMenuSession(tgId, lang, sup.id);
            await ctx.reply('❌ Sessiya buzildi. Qaytadan boshlang.');
            return true;
        }
        const totalAmount = ses.weightKg * ses.pricePerKg;
        await prisma.recycleManualIntake.create({
            data: {
                supervisorId: sup.id,
                pointId: sup.pointId,
                date,
                weightKg: ses.weightKg,
                pricePerKg: ses.pricePerKg,
                totalAmount,
                note,
            },
        });
        await createBotEvent({
            sourceBot: 'supervisor',
            eventType: 'journal.intake.created',
            entityType: 'recycle_manual_intake',
            severity: 'success',
            title: 'Qabul jurnali yozuvi saqlandi',
            message: `${sup.name} ${fmtN(Math.round(ses.weightKg))} kg qabul yozuvini saqladi.`,
            supervisorId: sup.id,
            pointId: sup.pointId ?? undefined,
            payload: {
                date: date.toISOString(),
                weightKg: ses.weightKg,
                pricePerKg: ses.pricePerKg,
                totalAmount,
                note,
            },
        });
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply(
            `✅ <b>Qabul yozuvi saqlandi</b>\n\n` +
            `📅 ${humanJournalDate(date)}\n⚖️ ${fmtN(Math.round(ses.weightKg))} kg\n` +
            `💵 ${fmtN(Math.round(ses.pricePerKg))} so'm/kg\n` +
            `🧾 Jami: <b>${fmtN(Math.round(totalAmount))} so'm</b>\n\n` +
            await buildDailyJournalMessage(sup.id, date),
            { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
        );
        return true;
    }
    return false;
}
