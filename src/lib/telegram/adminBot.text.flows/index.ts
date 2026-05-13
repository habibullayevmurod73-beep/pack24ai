// ─── Jurnal flow routing ─────────────────────────────────────────────────────
// adminBot.text.ts dagi jurnal sessiyalarini alohida handlerlarga yo'naltiradi

import type { Context } from 'telegraf';
import type { Lang } from '../i18n';
import { handleIntakeFlow } from './intakeFlow';
import { handlePressFlow } from './pressFlow';
import { handleExpenseFlow } from './expenseFlow';
import { handleCashFlow } from './cashFlow';
import { handleSaleFlow } from './saleFlow';

interface SupervisorInfo { id: number; name: string; pointId: number | null; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Session = any;

/**
 * Jurnal flow turini aniqlaydi va mos handlerga delegatsiya qiladi.
 * @returns true — agar flow handler ishlov bergan bo'lsa, false — aks holda
 */
export async function handleJournalFlow(
    ctx: Context, tgId: string, text: string,
    ses: Session, sup: SupervisorInfo, lang: Lang,
): Promise<boolean> {
    switch (ses.flow) {
        case 'intake':  return handleIntakeFlow(ctx, tgId, text, ses, sup, lang);
        case 'press':   return handlePressFlow(ctx, tgId, text, ses, sup, lang);
        case 'expense': return handleExpenseFlow(ctx, tgId, text, ses, sup, lang);
        case 'cash':    return handleCashFlow(ctx, tgId, text, ses, sup, lang);
        case 'sale':    return handleSaleFlow(ctx, tgId, text, ses, sup, lang);
        default:        return false;
    }
}
