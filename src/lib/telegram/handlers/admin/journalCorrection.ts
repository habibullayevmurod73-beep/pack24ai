// Thin orchestrator — all logic lives in journalCorrection/ sub-modules
// Backward-compatible: every original export is re-exported here.

export {
    JOURNAL_CORRECTION_REPLY_BUTTON,
    journalCorrectionSessions,
    correctionFilterDayKeyboard,
    correctionNewDateKeyboard,
    tryJournalCorrectionCallback,
    handleJournalCorrectionText,
} from './journalCorrection/index';

export type { JournalCorrectionSession } from './journalCorrection/index';
