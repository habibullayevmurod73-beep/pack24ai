import { Telegraf } from 'telegraf';
import { applyBotDefaults } from './botInit';
import { getCustomerBotToken } from './botTokens';
import { registerCustomerHandlers } from './handlers/customer';

// ─── Customer Bot init ────────────────────────────────────────────────────────
let customerBotInstance: Telegraf | null = null;

export function resetInitializedCustomerBot() {
    if (customerBotInstance) {
        try {
            customerBotInstance.stop('reset');
        } catch {}
    }

    customerBotInstance = null;
}

export async function initCustomerBot(): Promise<Telegraf | null> {
    if (customerBotInstance) return customerBotInstance;

    const token = await getCustomerBotToken();
    if (!token) {
        console.warn('[CustomerBot] CUSTOMER_BOT_TOKEN topilmadi (.env yoki TelegramConfig)');
        return null;
    }

    const bot = new Telegraf(token);
    await applyBotDefaults(bot, 'CustomerBot');

    // Register all extracted handlers
    registerCustomerHandlers(bot);

    customerBotInstance = bot;
    return bot;
};

