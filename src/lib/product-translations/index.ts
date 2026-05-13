// ─── Product Translations Module — Barrel Export ─────────────────────────────
import type { Language } from '../translations';
import { CATEGORY_NAMES } from './categories';
import { PRODUCT_UI, TERM_MAP } from './terms';

// ── Kategotiya tarjimasi ─────────────────────────────────────────────────────
export function translateCategory(categorySlugOrName: string, lang: Language): string {
    const slug = categorySlugOrName.toLowerCase().replace(/\s+/g, '-');
    const entry = CATEGORY_NAMES[slug];
    if (entry) return entry[lang] ?? entry.uz ?? categorySlugOrName;

    // Slug topilmasa — nom bo'yicha qidirish
    for (const [, names] of Object.entries(CATEGORY_NAMES)) {
        for (const val of Object.values(names)) {
            if (val.toLowerCase() === categorySlugOrName.toLowerCase()) {
                return names[lang] ?? names.uz ?? categorySlugOrName;
            }
        }
    }
    return categorySlugOrName;
}

// ── Mahsulot nomi tarjimasi ──────────────────────────────────────────────────
export function translateProductName(name: string, lang: Language): string {
    if (lang === 'uz') return name;

    let translated = name;
    for (const [uzTerm, translations] of Object.entries(TERM_MAP)) {
        const langTerm = translations[lang];
        if (langTerm && translated.toLowerCase().includes(uzTerm.toLowerCase())) {
            translated = translated.replace(
                new RegExp(uzTerm, 'gi'),
                langTerm,
            );
        }
    }
    return translated;
}

// ── UI matn tarjimasi ────────────────────────────────────────────────────────
export function getProductUI(key: keyof typeof PRODUCT_UI, lang: Language): string {
    return PRODUCT_UI[key]?.[lang] ?? PRODUCT_UI[key]?.uz ?? key;
}

// ── Re-exportlar ─────────────────────────────────────────────────────────────
export { CATEGORY_NAMES } from './categories';
export { PRODUCT_UI, TERM_MAP } from './terms';
