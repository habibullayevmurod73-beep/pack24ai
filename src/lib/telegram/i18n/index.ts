// ─── Pack24 Ko'p tilli matnlar bazasi (modularizatsiya qilingan) ──────────────
// Har bir kalit uchun 3 tilda tarjima — bot turi bo'yicha alohida fayllarda

export type Lang = 'uz' | 'ru' | 'en';

// ── Barcha modullarni import qilish ─────────────────────────────────────────
import { commonTexts } from './common';
import { customerTexts } from './customer';
import { driverTexts } from './driver';
import { supervisorTexts } from './supervisor';
import { notificationTexts } from './notifications';
import { prtsTexts } from './prts';

// ── Birlashtrilgan lug'at ────────────────────────────────────────────────────
type Texts = Record<string, Record<Lang, string>>;

export const t: Texts = {
    ...commonTexts,
    ...customerTexts,
    ...driverTexts,
    ...supervisorTexts,
    ...notificationTexts,
    ...prtsTexts,
};

// ── Yordamchi funksiyalar ────────────────────────────────────────────────────

/** Matnni kalit va til bo'yicha olish */
export function getText(key: string, lang: Lang): string {
    return t[key]?.[lang] || t[key]?.uz || key;
}

/** Template o'zgaruvchilarni almashtirish */
export function formatText(key: string, lang: Lang, vars: Record<string, string>): string {
    let text = getText(key, lang);
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

// ── Re-exportlar (to'g'ridan modul kerak bo'lganda ishlatish uchun) ──────────
export { commonTexts } from './common';
export { customerTexts } from './customer';
export { driverTexts } from './driver';
export { supervisorTexts } from './supervisor';
export { notificationTexts } from './notifications';
export { prtsTexts } from './prts';
