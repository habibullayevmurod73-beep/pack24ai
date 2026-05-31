import { Context } from 'telegraf';
import { Supervisor } from '@prisma/client';
import { CorrectionEntityType } from '@/lib/domain/recycling/journalCorrections';
import { startOfDay, startOfYesterday } from '@/lib/domain/recycling/journal';
import { Lang } from '../../../i18n';
import { humanJournalDate } from '../../../adminBot.shared';
import {
    EC,
    journalCorrectionSessions,
    compactEntity,
} from './types';
import { correctionFilterDayKeyboard, correctionNewDateKeyboard } from './keyboards';
import { fetchRows, serializeRow } from './dataAccess';
import { applyCorrectionNewDateAndContinueFields } from './fieldWizard';

/** @returns handled */
export async function tryJournalCorrectionCallback(
    ctx: Context,
    data: string,
    sup: Supervisor,
    tgId: string,
    lang: Lang,
): Promise<boolean> {
    if (data.startsWith('cent_')) {
        const k = data.replace('cent_', '') as keyof typeof EC;
        const entity = EC[k];
        if (!entity) return false;

        journalCorrectionSessions.set(tgId, {
            stage: 'pick_day',
            entity,
        });

        await ctx.reply(
            '🔎 <b>Qaysi kun yozuvlari</b>tanlanadi?\n\nKeyinchalik <b>yangi sana</b> ham belgilaysiz.',
            { parse_mode: 'HTML', reply_markup: correctionFilterDayKeyboard() },
        );
        await ctx.answerCbQuery('✏️');
        return true;
    }

    const dayPick = /^cbf_(t|y|m)$/.exec(data);
    if (dayPick) {
        const ses = journalCorrectionSessions.get(tgId);
        if (!ses?.entity || ses.stage !== 'pick_day') {
            await ctx.answerCbQuery('Avval tahrir turini tanlang');
            return true;
        }

        if (dayPick[1] === 'm') {
            journalCorrectionSessions.set(tgId, { ...ses, stage: 'manual_list_day', listDay: undefined });
            await ctx.reply(
                `Ro\'yxat uchun sanani yuboring (qaysi kundagi yozuvlar).\n` +
                    `<i>Masalan:</i> <code>bugun</code> yoki <code>kecha</code>`,
                { parse_mode: 'HTML' },
            );
            await ctx.answerCbQuery('✏️');
            return true;
        }

        const day = dayPick[1] === 't' ? startOfDay(new Date()) : startOfYesterday();
        await showCorrectionRowPicker(ctx, sup, tgId, ses.entity, day, lang);
        await ctx.answerCbQuery('📅');
        return true;
    }

    const crow = /^crow([ipesc])_(\d+)$/.exec(data);
    if (crow) {
        const key = crow[1] as keyof typeof EC;
        const entity = EC[key];
        const id = Number(crow[2]);
        const prev = await serializeRow(entity, id, sup.id);
        if (!prev) {
            await ctx.answerCbQuery('Topilmadi');
            return true;
        }

        journalCorrectionSessions.set(tgId, {
            stage: 'pick_newdate',
            entity,
            recordId: id,
            draft: { ...prev, _id: id },
        });

        await ctx.reply(
            `📝 Tanlandi: yozuv #${id}\n\n1-qadam — <b>yangi sanani</b> tanlang (yoki keyin qo\'lda):`,
            { parse_mode: 'HTML', reply_markup: correctionNewDateKeyboard() },
        );
        await ctx.answerCbQuery('📝');
        return true;
    }

    const cnd = /^cnd_(t|y|m)$/.exec(data);
    if (cnd) {
        const ses = journalCorrectionSessions.get(tgId);
        if (
            ses?.stage !== 'pick_newdate' ||
            !ses.entity ||
            !ses.recordId ||
            !ses.draft
        ) {
            await ctx.answerCbQuery('Sessiya tugagan');
            return true;
        }

        if (cnd[1] === 'm') {
            journalCorrectionSessions.set(tgId, { ...ses, stage: 'type_new_date' });
            await ctx.reply('Yangi sanani yuboring: <code>2026-05-02</code> yoki <code>bugun</code>', {
                parse_mode: 'HTML',
            });
            await ctx.answerCbQuery('✏️');
            return true;
        }

        const d = cnd[1] === 't' ? startOfDay(new Date()) : startOfYesterday();
        await applyCorrectionNewDateAndContinueFields(ctx, tgId, lang, sup, ses.entity, ses.recordId, {
            ...ses.draft,
            date: d.toISOString(),
        });
        await ctx.answerCbQuery('📅');
        return true;
    }

    return false;
}

export async function showCorrectionRowPicker(
    ctx: Context,
    sup: Supervisor,
    tgId: string,
    entity: CorrectionEntityType,
    day: Date,
    _lang: Lang,
) {
    const rows = await fetchRows(entity, sup.id, day, 14);
    if (rows.length === 0) {
        journalCorrectionSessions.set(tgId, { stage: 'pick_day', entity });
        await ctx.reply('Bu kun uchun yozuv topilmadi. Boshqa kunni tanlang.', {
            reply_markup: correctionFilterDayKeyboard(),
        });
        return;
    }

    const key = compactEntity(entity);

    journalCorrectionSessions.set(tgId, {
        stage: 'pick_row',
        entity,
        listDay: startOfDay(day).toISOString(),
    });

    const label = humanJournalDate(startOfDay(day));
    await ctx.reply(
        `📋 <b>${label}</b> — tahrirlanadigan yozuvni tanlang:\n\nHQ tasdig\'idan keyin hisobot yangilanadi.`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: rows.map((r) => {
                    const suffix =
                        entity === 'sales_log'
                            ? `${String((r as unknown as { customerName: string }).customerName).slice(0, 14)} · #${r.id}`
                            : `#${r.id}`;
                    return [{ text: `✏️ ${suffix}`, callback_data: `crow${key}_${r.id}` }];
                }),
            },
        },
    );
}
