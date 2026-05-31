import { CorrectionEntityType } from '@/lib/domain/recycling/journalCorrections';
import { createTelegramSessionStore } from '../../../sessionStore';

export const JOURNAL_CORRECTION_REPLY_BUTTON = '✏️ Jurnal tahriri (HQ)';

export const EC: Record<'i' | 'p' | 'e' | 'c' | 's', CorrectionEntityType> = {
    i: 'manual_intake',
    p: 'press_log',
    e: 'expense_log',
    c: 'daily_cash',
    s: 'sales_log',
};

export interface JournalCorrectionSession {
    stage: string;
    entity?: CorrectionEntityType;
    listDay?: string;
    draft?: Record<string, unknown>;
    recordId?: number;
}

export const journalCorrectionSessions = createTelegramSessionStore<JournalCorrectionSession>(
    'admin-journal-correction-sessions',
);

export function compactEntity(entity: CorrectionEntityType): keyof typeof EC {
    const entry = Object.entries(EC).find(([, v]) => v === entity);
    return (entry?.[0] ?? 'i') as keyof typeof EC;
}

export function escapeHtmlLd(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
