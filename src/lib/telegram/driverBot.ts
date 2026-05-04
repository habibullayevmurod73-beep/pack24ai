import { Telegraf } from 'telegraf';
import { applyBotDefaults } from './botInit';
import { getDriverBotToken } from './botTokens';
import { registerDriverHandlers } from './handlers/driver';

// ─── Driver Bot init ──────────────────────────────────────────────────────────
let driverBotInstance: Telegraf | null = null;

export async function initDriverBot(): Promise<Telegraf | null> {
    if (driverBotInstance) return driverBotInstance;

    const token = getDriverBotToken();
    if (!token) {
        console.warn('[DriverBot] DRIVER_BOT_TOKEN topilmadi');
        return null;
    }

    const bot = new Telegraf(token);
    await applyBotDefaults(bot, 'DriverBot');

    // Register all extracted handlers
    registerDriverHandlers(bot);

    driverBotInstance = bot;
    return bot;
}
