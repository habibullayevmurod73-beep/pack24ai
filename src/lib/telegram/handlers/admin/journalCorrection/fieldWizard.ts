import { Context } from 'telegraf';
import { Supervisor } from '@prisma/client';
import {
    CorrectionEntityType,
    createJournalCorrectionRequest,
} from '@/lib/domain/recycling/journalCorrections';
import { startOfDay } from '@/lib/domain/recycling/journal';
import { Lang } from '../../../i18n';
import {
    setMenuSession,
    fmtN,
    parseJournalDate,
    parseNumberInput,
    isSkipText,
} from '../../../adminBot.shared';
import { supervisorMainKeyboard } from '../../../keyboards';
import {
    JOURNAL_CORRECTION_REPLY_BUTTON,
    JournalCorrectionSession,
    journalCorrectionSessions,
    escapeHtmlLd,
} from './types';
import { entityKeyboard } from './keyboards';
import { serializeRow, summarize, sanitizeDraft } from './dataAccess';
import { showCorrectionRowPicker } from './callbacks';

/** @returns true if handled */
export async function handleJournalCorrectionText(
    ctx: Context,
    tgId: string,
    text: string,
    sup: Supervisor,
    lang: Lang,
): Promise<boolean> {
    const raw = text.trim();
    const low = raw.toLowerCase();

    if (text === JOURNAL_CORRECTION_REPLY_BUTTON) {
        journalCorrectionSessions.set(tgId, { stage: 'pick_entity' });
        await ctx.reply(
            '📝 <b>Jurnal yozuvini tahrirlash</b>\n\nTurini tanlang. So\'rov <b>HQ admin</b> tasdig\'idan keyin hisobotda ko\'rinadi.',
            {
                parse_mode: 'HTML',
                reply_markup: entityKeyboard(),
            },
        );
        return true;
    }

    const ses = journalCorrectionSessions.get(tgId);

    if (ses?.stage === 'manual_list_day' && ses.entity) {
        const parsed = parseJournalDate(raw);
        if (!parsed) {
            await ctx.reply('❌ Sana noto\'g\'ri. `bugun` yoki `2026-05-01`,', { parse_mode: 'Markdown' });
            return true;
        }
        await showCorrectionRowPicker(ctx, sup, tgId, ses.entity, parsed, lang);
        return true;
    }

    if (ses?.stage === 'type_new_date' && ses.entity && ses.recordId && ses.draft) {
        const parsed = parseJournalDate(raw);
        if (!parsed) {
            await ctx.reply('❌ Sana noto\'g\'ri.');
            return true;
        }
        await applyCorrectionNewDateAndContinueFields(ctx, tgId, lang, sup, ses.entity, ses.recordId, {
            ...ses.draft,
            date: startOfDay(parsed).toISOString(),
        });
        return true;
    }

    return continueFieldStages(ctx, tgId, lang, sup, ses, raw, low);
}

export async function applyCorrectionNewDateAndContinueFields(
    ctx: Context,
    tgId: string,
    lang: Lang,
    sup: Supervisor,
    entity: CorrectionEntityType,
    recordId: number,
    draft: Record<string, unknown>,
) {
    const nextDraft = { ...draft, date: draft.date };

    switch (entity) {
        case 'manual_intake':
            journalCorrectionSessions.set(tgId, {
                stage: 'fld_intake_weight',
                entity,
                recordId,
                draft: nextDraft,
            });
            await ctx.reply(
                `⚖️ Yangi og\'irlik (kg). Hozirgi: <b>${fmtN(Math.round(Number(draft.weightKg)))}</b>. O\'zgartirmasdan <code>-</code>`,
                { parse_mode: 'HTML' },
            );
            break;
        case 'press_log':
            journalCorrectionSessions.set(tgId, {
                stage: 'fld_press_kg',
                entity,
                recordId,
                draft: nextDraft,
            });
            await ctx.reply(
                `⚖️ Yangi press (kg). Hozirgi: <b>${fmtN(Math.round(Number(draft.pressedKg)))}</b>. <code>-</code> — o\'zgartirmasdan`,
                { parse_mode: 'HTML' },
            );
            break;
        case 'expense_log':
            journalCorrectionSessions.set(tgId, {
                stage: 'fld_expense',
                entity,
                recordId,
                draft: nextDraft,
            });
            await ctx.reply(
                `💸 Yangi xarajat. Hozirgi: <b>${fmtN(Math.round(Number(draft.expenseAmount)))}</b>. <code>-</code> — o\'zgartirmasdan`,
                { parse_mode: 'HTML' },
            );
            break;
        case 'daily_cash':
            journalCorrectionSessions.set(tgId, {
                stage: 'fld_cash_bal',
                entity,
                recordId,
                draft: nextDraft,
            });
            await ctx.reply(
                `🏦 Yangi boshlang\'ich kassa. Hozirgi: <b>${fmtN(Math.round(Number(draft.openingBalance)))}</b>`,
                { parse_mode: 'HTML' },
            );
            break;
        case 'sales_log':
            journalCorrectionSessions.set(tgId, {
                stage: 'fld_sale_customer',
                entity,
                recordId,
                draft: nextDraft,
            });
            await ctx.reply(
                `🏢 Yangi mijoz nomi. Hozirgi: <b>${escapeHtmlLd(String(draft.customerName))}</b>. <code>-</code> — o\'zgartirmasdan`,
                { parse_mode: 'HTML' },
            );
            break;
        default:
            break;
    }
}

async function continueFieldStages(
    ctx: Context,
    tgId: string,
    lang: Lang,
    sup: Supervisor,
    ses: JournalCorrectionSession | undefined,
    raw: string,
    low: string,
): Promise<boolean> {
    if (!ses?.entity || ses.recordId == null || !ses.draft) return false;

    if (['bekor', 'cancel', '/cancel', '❌'].includes(low)) {
        journalCorrectionSessions.delete(tgId);
        setMenuSession(tgId, lang, sup.id);
        await ctx.reply('❌ Tahrir bekor qilindi.', { reply_markup: supervisorMainKeyboard() });
        return true;
    }

    const d = { ...ses.draft };
    let nextStage = '';
    let nextPrompt = '';

    const advance = async () => {
        journalCorrectionSessions.set(tgId, {
            ...ses,
            stage: nextStage,
            draft: d,
            recordId: ses.recordId,
            entity: ses.entity,
        });
        if (nextPrompt) await ctx.reply(nextPrompt, { parse_mode: 'HTML' });
    };

    switch (ses.stage) {
        case 'fld_intake_weight': {
            let w = d.weightKg as number;
            if (!isSkipText(raw)) {
                const n = parseNumberInput(raw);
                if (Number.isNaN(n) || n <= 0) {
                    await ctx.reply('❌ Noto\'g\'ri kg');
                    return true;
                }
                w = n;
            }
            d.weightKg = w;
            nextStage = 'fld_intake_price';
            nextPrompt =
                `💵 Yangi narx so'm/kg. Hozirgi: <b>${fmtN(Math.round(Number(d.pricePerKg)))}</b>. <code>-</code>`;
            break;
        }
        case 'fld_intake_price': {
            let p = d.pricePerKg as number;
            if (!isSkipText(raw)) {
                const n = parseNumberInput(raw);
                if (Number.isNaN(n) || n <= 0) {
                    await ctx.reply('❌ Noto\'g\'ri narx');
                    return true;
                }
                p = n;
            }
            d.pricePerKg = p;
            nextStage = 'fld_intake_note';
            nextPrompt =
                '📝 Izoh. Hozirgi: ' +
                escapeHtmlLd(String(d.note ?? '—')) +
                '. <code>-</code> — o\'zgartirmasdan';
            break;
        }
        case 'fld_intake_note': {
            d.note = isSkipText(raw) ? (d.note as string | null | undefined) ?? null : raw;
            journalCorrectionSessions.delete(tgId);
            setMenuSession(tgId, lang, sup.id);
            await submitCorrection(ctx, sup, ses.entity, ses.recordId, d);
            return true;
        }
        case 'fld_press_kg': {
            let w = Number(d.pressedKg);
            if (!isSkipText(raw)) {
                const n = parseNumberInput(raw);
                if (Number.isNaN(n) || n <= 0) {
                    await ctx.reply('❌ Noto\'g\'ri kg');
                    return true;
                }
                w = n;
            }
            d.pressedKg = w;
            nextStage = 'fld_press_bales';
            nextPrompt =
                '📦 Toylar soni. Hozirgi: <b>' + String(d.baleCount) + '</b>. <code>-</code>';
            break;
        }
        case 'fld_press_bales': {
            let bc = Number(d.baleCount);
            if (!isSkipText(raw)) {
                bc = parseInt(raw.replace(/\s/g, ''), 10);
                if (Number.isNaN(bc) || bc <= 0) {
                    await ctx.reply('❌ Toy soni noto\'g\'ri');
                    return true;
                }
            }
            d.baleCount = bc;
            nextStage = 'fld_press_ops';
            nextPrompt =
                '👷 Bajaruvchi(lar). Hozirgi: ' +
                escapeHtmlLd(String(d.operators ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_press_ops': {
            d.operators = isSkipText(raw) ? (d.operators as string | null) : raw.trim() || null;
            nextStage = 'fld_press_note';
            nextPrompt =
                '📝 Izoh (ixt.). Hozirgi: ' +
                escapeHtmlLd(String(d.note ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_press_note': {
            d.note = isSkipText(raw) ? (d.note as string | null | undefined) ?? null : raw.trim() || null;
            journalCorrectionSessions.delete(tgId);
            setMenuSession(tgId, lang, sup.id);
            await submitCorrection(ctx, sup, ses.entity, ses.recordId, d);
            return true;
        }
        case 'fld_expense': {
            let x = Number(d.expenseAmount);
            if (!isSkipText(raw)) {
                x = parseNumberInput(raw) || 0;
                if (Number.isNaN(x) || x < 0) {
                    await ctx.reply('❌ Noto\'g\'ri summa');
                    return true;
                }
            }
            d.expenseAmount = x;
            nextStage = 'fld_advance';
            nextPrompt =
                '💼 Avans. Hozirgi: <b>' +
                fmtN(Math.round(Number(d.advanceAmount))) +
                '</b>. <code>-</code>';
            break;
        }
        case 'fld_advance': {
            let a = Number(d.advanceAmount);
            if (!isSkipText(raw)) {
                a = parseNumberInput(raw) || 0;
                if (Number.isNaN(a) || a < 0) {
                    await ctx.reply('❌ Noto\'g\'ri');
                    return true;
                }
            }
            d.advanceAmount = a;
            if ((Number(d.expenseAmount) || 0) <= 0 && a <= 0) {
                await ctx.reply('❌ Kamida bittasi musbat bo\'lishi kerak.');
                return true;
            }
            nextStage = 'fld_exp_comment';
            nextPrompt =
                '📝 Izoh / komment. Hozirgi: ' +
                escapeHtmlLd(String(d.comment ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_exp_comment': {
            d.comment = isSkipText(raw) ? (d.comment as string | null) : raw.trim() || null;
            journalCorrectionSessions.delete(tgId);
            setMenuSession(tgId, lang, sup.id);
            await submitCorrection(ctx, sup, ses.entity, ses.recordId, d);
            return true;
        }
        case 'fld_cash_bal': {
            const n = parseNumberInput(raw);
            if (Number.isNaN(n) || n < 0) {
                await ctx.reply('❌ Kassa summasi noto\'g\'ri');
                return true;
            }
            d.openingBalance = n;
            nextStage = 'fld_cash_note';
            nextPrompt =
                '📝 Izoh (ixt.). Hozirgi: ' +
                escapeHtmlLd(String(d.note ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_cash_note': {
            d.note = isSkipText(raw) ? (d.note as string | null | undefined) ?? null : raw.trim() || null;
            journalCorrectionSessions.delete(tgId);
            setMenuSession(tgId, lang, sup.id);
            await submitCorrection(ctx, sup, ses.entity, ses.recordId, d);
            return true;
        }
        case 'fld_sale_customer': {
            d.customerName = isSkipText(raw) ? String(d.customerName) : raw.trim();
            if (!String(d.customerName)) {
                await ctx.reply('❌ Bo\'sh');
                return true;
            }
            nextStage = 'fld_sale_w';
            nextPrompt =
                '⚖️ Massa kg. Hozirgi: <b>' +
                fmtN(Math.round(Number(d.weightKg))) +
                '</b>. <code>-</code>';
            break;
        }
        case 'fld_sale_w': {
            let w = Number(d.weightKg);
            if (!isSkipText(raw)) {
                const n = parseNumberInput(raw);
                if (Number.isNaN(n) || n <= 0) {
                    await ctx.reply('❌ Noto\'g\'ri kg');
                    return true;
                }
                w = n;
            }
            d.weightKg = w;
            nextStage = 'fld_sale_bales';
            nextPrompt =
                '📦 Toylar soni (0 mumkin). Hozirgi: <b>' +
                String(d.baleCount) +
                '</b>. <code>-</code>';
            break;
        }
        case 'fld_sale_bales': {
            let bc = Number(d.baleCount);
            if (!isSkipText(raw)) {
                bc = parseInt(raw.replace(/\s/g, ''), 10);
                if (Number.isNaN(bc) || bc < 0) {
                    await ctx.reply('❌ Toy soni noto\'g\'ri');
                    return true;
                }
            }
            d.baleCount = bc;
            nextStage = 'fld_sale_price';
            nextPrompt =
                '💵 1 kg narxi. Hozirgi: <b>' +
                fmtN(Math.round(Number(d.pricePerKg))) +
                '</b>. <code>-</code>';
            break;
        }
        case 'fld_sale_price': {
            let p = Number(d.pricePerKg);
            if (!isSkipText(raw)) {
                const n = parseNumberInput(raw);
                if (Number.isNaN(n) || n <= 0) {
                    await ctx.reply('❌ Narx noto\'g\'ri');
                    return true;
                }
                p = n;
            }
            d.pricePerKg = p;
            nextStage = 'fld_sale_vehicle';
            nextPrompt =
                '🚚 Mashina tur (ixt.). Hozirgi: ' +
                escapeHtmlLd(String(d.vehicleType ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_sale_vehicle': {
            d.vehicleType = isSkipText(raw)
                ? (d.vehicleType as string | null)
                : raw.trim() || null;
            nextStage = 'fld_sale_plate';
            nextPrompt =
                '🔢 Davlat raqami (ixt.). Hozirgi: ' +
                escapeHtmlLd(String(d.plateNumber ?? '—')) +
                '. <code>-</code>';
            break;
        }
        case 'fld_sale_plate': {
            d.plateNumber = isSkipText(raw)
                ? (d.plateNumber as string | null)
                : raw.trim() || null;
            journalCorrectionSessions.delete(tgId);
            setMenuSession(tgId, lang, sup.id);
            await submitCorrection(ctx, sup, ses.entity, ses.recordId, d);
            return true;
        }
        default:
            return false;
    }

    await advance();
    return true;
}

async function submitCorrection(
    ctx: Context,
    sup: Supervisor,
    entity: CorrectionEntityType,
    recordId: number,
    draftRaw: Record<string, unknown>,
) {
    delete draftRaw._id;
    const prev = await serializeRow(entity, recordId, sup.id);
    if (!prev) {
        await ctx.reply('❌ Yozuv topilmadi.');
        return;
    }

    await createJournalCorrectionRequest({
        entityType: entity,
        entityId: recordId,
        supervisorId: sup.id,
        pointId: sup.pointId,
        previousPayload: prev,
        proposedPayload: sanitizeDraft(entity, draftRaw),
        summaryLine: summarize(entity, { ...draftRaw, _id: recordId }),
    });

    await ctx.reply(
        '✅ <b>So\'rov yuborildi.</b>\n\nHQ admin @pack24admin_bot orqali tasdiqlagach, hisobotda yangilanadi.',
        {
            parse_mode: 'HTML',
            reply_markup: supervisorMainKeyboard(),
        },
    );
}
