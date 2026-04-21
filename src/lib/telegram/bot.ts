// ═══════════════════════════════════════════════════════════════════════════════
// Pack24 Telegram Bot — Orchestrator
// 106KB monolitik fayl → modular arxitekturaga aylantrildi
//
// Handler modullari:
//   handlers/startHandler.ts      — /start (rol aniqlash)
//   handlers/arizaHandler.ts      — /ariza (ariza yaratish flow)
//   handlers/supervisorHandler.ts — /arizalar, /haydovchilar, /tolash
//   handlers/driverHandler.ts     — /ishlarim, /status, /hisobot
//   handlers/customerHandler.ts   — /arizalarim, /buyurtma, /narxlar, /shikoyat, /help
//   handlers/callbackHandler.ts   — Barcha inline callback_query
//   handlers/textHandler.ts       — Text + Contact messages
//
// Yordamchi modullari:
//   constants.ts  — MAT, fmtN, btn, getStatusLabel
//   sessions.ts   — arizaSessions, complaintSessions, registrationSessions
//   keyboards.ts  — customerKeyboard, supervisorKeyboard, driverKeyboard
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';

// Handler imports
import { registerStartHandler } from './handlers/startHandler';
import { registerArizaHandler } from './handlers/arizaHandler';
import { registerSupervisorHandlers } from './handlers/supervisorHandler';
import { registerDriverHandlers } from './handlers/driverHandler';
import { registerCustomerHandlers } from './handlers/customerHandler';
import { registerCallbackHandler } from './handlers/callbackHandler';
import { registerTextHandler } from './handlers/textHandler';

let botInstance: Telegraf | null = null;
let pollingStarted = false;

// ─── Bot yaratish va handlerlarni ro'yxatdan o'tkazish ─────────────────────
export const getBot = async () => {
    if (botInstance) return botInstance;

    const config = await prisma.telegramConfig.findFirst();
    if (!config || !config.botToken) {
        console.warn('Telegram Bot Token not configured');
        return null;
    }

    const bot = new Telegraf(config.botToken);

    // ─── Buyruqlar menyusini ro'yxatga olish ──────────────────────────────
    await bot.telegram.setMyCommands([
        { command: 'start',      description: '🏠 Bosh menyu' },
        { command: 'ariza',      description: '♻️ Makulatura topshirish' },
        { command: 'arizalarim', description: '📋 Mening arizalarim' },
        { command: 'buyurtma',   description: '📦 Buyurtmani kuzatish' },
        { command: 'narxlar',    description: '💰 Material narxlari' },
        { command: 'help',       description: '❓ Yordam' },
    ]).catch(() => {});

    // ─── Middleware — log ──────────────────────────────────────────────────
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        console.log(`TG ${ctx.updateType} in ${Date.now() - start}ms`);
    });

    // ─── Handlerlarni ro'yxatga olish (tartib muhim!) ─────────────────────
    // 1. /start — rolni aniqlash
    registerStartHandler(bot);

    // 2. /ariza — ariza flow boshlash
    registerArizaHandler(bot);

    // 3. Masul shaxs buyruqlari
    registerSupervisorHandlers(bot);

    // 4. Haydovchi buyruqlari
    registerDriverHandlers(bot);

    // 5. Mijoz buyruqlari (buyurtma, narxlar, shikoyat, help)
    registerCustomerHandlers(bot);

    // 6. Inline callback_query — barcha tugma bosilishlari
    registerCallbackHandler(bot);

    // 7. Text + Contact — matn va kontakt xabarlari (eng oxirida!)
    registerTextHandler(bot);

    botInstance = bot;
    return bot;
};

// ─── Reset ──────────────────────────────────────────────────────────────────
export const resetBot = () => {
    if (botInstance) {
        try { botInstance.stop('reset'); } catch {}
    }
    botInstance = null;
    pollingStarted = false;
};

// ─── Polling rejim (development uchun — webhook kerak emas) ─────────────────
export const startPolling = async () => {
    if (pollingStarted) return;
    const bot = await getBot();
    if (!bot) {
        console.warn('[Bot] Token sozlanmagan — polling boshlanmadi');
        return;
    }

    try {
        // Avval webhook ni o'chirish
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('🤖 Webhook o\'chirildi, polling boshlanmoqda...');
    } catch (e) {
        console.error('Webhook o\'chirishda xato:', e);
    }

    pollingStarted = true;
    bot.launch({ dropPendingUpdates: true })
        .then(() => console.log('🤖 Bot polling rejimda ishga tushdi!'))
        .catch((err) => {
            console.error('Bot polling xatosi:', err);
            pollingStarted = false;
        });

    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

// ─── Admin xabar yuborish (salesChatId ga) ──────────────────────────────────
export const sendTelegramMessage = async (message: string) => {
    try {
        const bot = await getBot();
        if (!bot) return false;

        const config = await prisma.telegramConfig.findFirst();
        if (!config || !config.salesChatId) return false;

        const chatIds = config.salesChatId.split(',').map((id: string) => id.trim());
        for (const chatId of chatIds) {
            if (chatId) await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
        return true;
    } catch (error) {
        console.error('Telegramga xabar yuborishda xatolik:', error);
        return false;
    }
};
