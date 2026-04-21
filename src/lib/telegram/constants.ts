// ═══════════════════════════════════════════════════════════════════════════════
// Telegram Bot — Konstantalar va Yordamchi funksiyalar
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Material narxlari (so'm/kg) ─────────────────────────────────────────────
export interface MaterialInfo {
    label: string;
    emoji: string;
    price: number;
}

export const MAT: Record<string, MaterialInfo> = {
    qogoz:   { label: "Qog'oz (rangsiz)",  emoji: '📄', price: 600  },
    karton:  { label: 'Karton',            emoji: '📦', price: 700  },
    plastik: { label: 'Plastik',           emoji: '🧴', price: 1000 },
    temir:   { label: 'Temir/Metallar',   emoji: '🔩', price: 2000 },
    shisha:  { label: 'Shisha',            emoji: '🫙', price: 300  },
    gazeta:  { label: 'Gazeta',            emoji: '📰', price: 400  },
    mix:     { label: 'Aralash',           emoji: '🗑️', price: 500  },
};

// ─── Formatting yordamchilari ────────────────────────────────────────────────

/** Raqamni rus formatida chiqarish (1 000 000) */
export function fmtN(n: number): string {
    return n.toLocaleString('ru-RU');
}

/** Inline tugma yaratish */
export function btn(text: string, data: string) {
    return { text, callback_data: data };
}

// ─── Status labellar (Telegram xabarlari uchun) ──────────────────────────────
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        new: '🔵 Yangi',
        dispatched: '📤 Yo\'naltirildi',
        assigned: '👤 Tayinlandi',
        en_route: '🚚 Yo\'lda',
        arrived: '📍 Yetib keldi',
        collecting: '📦 Yig\'ilmoqda',
        collected: '✅ Yig\'ildi',
        confirmed: '💚 Tasdiqlandi',
        completed: '🟢 Bajarildi',
        disputed: '⚠️ Bahsli',
        cancelled: '🔴 Bekor',
    };
    return labels[status] || status;
}

// ─── Buyurtma status labellar ────────────────────────────────────────────────
export const ORDER_STATUS_MAP: Record<string, string> = {
    new: '🔵',
    processing: '🟡',
    shipping: '🚚',
    delivered: '✅',
    cancelled: '🔴',
    draft: '⚪',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
    new: '🔵 Yangi',
    processing: '🟡 Jarayonda',
    shipping: '🚚 Yo\'lda',
    delivered: '✅ Yetkazildi',
    cancelled: '🔴 Bekor',
    draft: '⚪ Qoralama',
};
