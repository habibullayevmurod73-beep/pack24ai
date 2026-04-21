// ═══════════════════════════════════════════════════════════════════════════════
// Telegram Bot — Sessiyalar (In-Memory State)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Ariza yaratish sessiyasi ────────────────────────────────────────────────
export interface ArizaSession {
    step: 'name' | 'phone' | 'region' | 'material' | 'volume' | 'address' | 'confirm';
    name?: string;
    phone?: string;
    regionId?: number;
    material?: string;
    volume?: number;
    address?: string;
}

export const arizaSessions = new Map<string, ArizaSession>();

// ─── Shikoyat sessiyasi ──────────────────────────────────────────────────────
export interface ComplaintSession {
    requestId: number;
    level: 'supervisor' | 'director';
}

export const complaintSessions = new Map<string, ComplaintSession>();

// ─── Ro'yxatdan o'tish sessiyasi (kod kiritish) ─────────────────────────────
export const registrationSessions = new Set<string>();
