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

export async function handleSaleFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    if (ses.stage === 'date') {
        const date = parseJournalDate(text);
        if (!date) { await ctx.reply('❌ Sana noto\'g\'ri. Namuna: `2026-04-01` yoki `bugun`', { parse_mode: 'Markdown' }); return true; }
        await advanceJournalAfterDateChosen(ctx, tgId, lang, sup.id, 'sale', date);
        return true;
    }
    if (ses.stage === 'customer') {
        const customerName = text.trim();
        if (!customerName) { await ctx.reply('❌ Mijoz nomi bo\'sh bo\'lmasligi kerak.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'sale', 'weight', { ...ses, customerName });
        await ctx.reply('⚖️ Sotilgan massa (kg) ni kiriting.');
        return true;
    }
    if (ses.stage === 'weight') {
        const weightKg = parseNumberInput(text);
        if (Number.isNaN(weightKg) || weightKg <= 0) { await ctx.reply('❌ Massa noto\'g\'ri.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'sale', 'bales', { ...ses, weightKg });
        await ctx.reply('📦 Toylar sonini kiriting. Bo\'lmasa <code>0</code> yozing.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'bales') {
        const baleCount = parseInt(text.replace(/\s/g, ''), 10);
        if (Number.isNaN(baleCount) || baleCount < 0) { await ctx.reply('❌ Toylar soni noto\'g\'ri.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'sale', 'price', { ...ses, baleCount });
        await ctx.reply('💵 1 kg narxini kiriting.');
        return true;
    }
    if (ses.stage === 'price') {
        const pricePerKg = parseNumberInput(text);
        if (Number.isNaN(pricePerKg) || pricePerKg <= 0) { await ctx.reply('❌ Narx noto\'g\'ri.'); return true; }
        setJournalSession(tgId, lang, sup.id, 'sale', 'vehicle', { ...ses, pricePerKg });
        await ctx.reply('🚚 Mashina turini kiriting yoki <code>-</code> yuboring.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'vehicle') {
        const vehicleType = isSkipText(text) ? null : text.trim();
        setJournalSession(tgId, lang, sup.id, 'sale', 'plate', { ...ses, vehicleType });
        await ctx.reply('🔢 Davlat raqamini kiriting yoki <code>-</code> yuboring.', { parse_mode: 'HTML' });
        return true;
    }
    if (ses.stage === 'plate') {
        const date = ses.journalDate ? new Date(ses.journalDate) : null;
        if (!date || !ses.customerName || !ses.weightKg || !ses.pricePerKg) {
            setMenuSession(tgId, lang, sup.id); await ctx.reply('❌ Sessiya buzildi. Qaytadan boshlang.'); return true;
        }
        const plateNumber = isSkipText(text) ? null : text.trim();
        const totalAmount = ses.weightKg * ses.pricePerKg;
        await prisma.recycleSalesLog.create({
            data: {
                supervisorId: sup.id, pointId: sup.pointId, date,
                customerName: ses.customerName, weightKg: ses.weightKg,
                baleCount: ses.baleCount || 0, pricePerKg: ses.pricePerKg,
                totalAmount, vehicleType: ses.vehicleType || null, plateNumber, note: null,
            },
        });
        await createBotEvent({
            sourceBot: 'supervisor', eventType: 'journal.sale.created', entityType: 'recycle_sales_log', severity: 'success',
            title: 'Sotuv jurnali yozuvi saqlandi',
            message: `${sup.name} ${ses.customerName} uchun ${fmtN(Math.round(totalAmount))} so'mlik sotuv yozuvini saqladi.`,
            supervisorId: sup.id, pointId: sup.pointId ?? undefined,
            payload: {
                date: date.toISOString(), customerName: ses.customerName,
                weightKg: ses.weightKg, baleCount: ses.baleCount || 0,
                pricePerKg: ses.pricePerKg, totalAmount,
                vehicleType: ses.vehicleType || null, plateNumber,
            },
        });
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply(
            `✅ <b>Sotuv yozuvi saqlandi</b>\n\n` +
            `📅 ${humanJournalDate(date)}\n` +
            `🏢 Mijoz: <b>${ses.customerName}</b>\n` +
            `⚖️ Massa: <b>${fmtN(Math.round(ses.weightKg))} kg</b>\n` +
            `📦 Soni: <b>${fmtN(ses.baleCount || 0)}</b>\n` +
            `💵 Narx: <b>${fmtN(Math.round(ses.pricePerKg))} so'm/kg</b>\n` +
            `🧾 Jami: <b>${fmtN(Math.round(totalAmount))} so'm</b>\n` +
            `${ses.vehicleType ? `🚚 Mashina: ${ses.vehicleType}\n` : ''}` +
            `${plateNumber ? `🔢 Davlat raqami: ${plateNumber}\n` : ''}\n` +
            await buildDailyJournalMessage(sup.id, date),
            { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
        );
        return true;
    }
    return false;
}
