// ─── Cross-Bot Notifier Service ──────────────────────────────────────────────
// Bu xizmat turli botlar orasidagi xabarlarni boshqaradi.
// Masalan: Haydovchi botda "yo'lga chiqdim" bosilganda, Mijoz botiga xabar boradi.

import { getCustomerBot, getDriverBot, getAdminBot } from './botManager';

type SendOptions = {
    parse_mode?: 'HTML' | 'Markdown';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reply_markup?: any;
};

// ─── Mijozga xabar yuborish (Customer Bot orqali) ────────────────────────────
export async function notifyCustomer(chatId: string, text: string, opts?: SendOptions) {
    try {
        const bot = await getCustomerBot();
        if (!bot) { console.warn('[Notifier] Customer bot mavjud emas'); return; }
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
    } catch (err) {
        console.error('[Notifier] Mijozga xabar yuborishda xatolik:', err);
    }
}

// ─── Haydovchiga xabar yuborish (Driver Bot orqali) ─────────────────────────
export async function notifyDriver(chatId: string, text: string, opts?: SendOptions) {
    try {
        const bot = await getDriverBot();
        if (!bot) { console.warn('[Notifier] Driver bot mavjud emas'); return; }
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
    } catch (err) {
        console.error('[Notifier] Haydovchiga xabar yuborishda xatolik:', err);
    }
}

// ─── Masulga xabar yuborish (Admin Bot orqali) ──────────────────────────────
export async function notifyAdmin(chatId: string, text: string, opts?: SendOptions) {
    try {
        const bot = await getAdminBot();
        if (!bot) { console.warn('[Notifier] Admin bot mavjud emas'); return; }
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
    } catch (err) {
        console.error('[Notifier] Masulga xabar yuborishda xatolik:', err);
    }
}

// ─── Lokatsiya yuborish ────────────────────────────────────────────────────
export async function sendLocationToCustomer(chatId: string, latitude: number, longitude: number) {
    try {
        const bot = await getCustomerBot();
        if (!bot) return;
        await bot.telegram.sendLocation(chatId, latitude, longitude);
    } catch (err) {
        console.error('[Notifier] Lokatsiya yuborishda xatolik:', err);
    }
}
