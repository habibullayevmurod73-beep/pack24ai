import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';

// ─── Bot instancelari ─────────────────────────────────────────────────────────
let customerBot: Telegraf | null = null;
let driverBot: Telegraf | null = null;
let adminBot: Telegraf | null = null;

// ─── Asosiy mijozlar botini olish ─────────────────────────────────────────────
export async function getCustomerBot(): Promise<Telegraf | null> {
    if (customerBot) return customerBot;

    const config = await prisma.telegramConfig.findFirst();
    if (!config?.botToken) {
        console.warn('[BotManager] Customer Bot Token topilmadi (TelegramConfig)');
        return null;
    }

    customerBot = new Telegraf(config.botToken);
    return customerBot;
}

// ─── Haydovchilar botini olish ────────────────────────────────────────────────
export async function getDriverBot(): Promise<Telegraf | null> {
    if (driverBot) return driverBot;

    const token = process.env.DRIVER_BOT_TOKEN;
    if (!token) {
        console.warn('[BotManager] DRIVER_BOT_TOKEN topilmadi (.env)');
        return null;
    }

    driverBot = new Telegraf(token);
    return driverBot;
}

// ─── Admin/Masul botini olish ─────────────────────────────────────────────────
export async function getAdminBot(): Promise<Telegraf | null> {
    if (adminBot) return adminBot;

    const token = process.env.ADMIN_BOT_TOKEN;
    if (!token) {
        console.warn('[BotManager] ADMIN_BOT_TOKEN topilmadi (.env)');
        return null;
    }

    adminBot = new Telegraf(token);
    return adminBot;
}

// ─── Barcha botlar ────────────────────────────────────────────────────────────
export async function getAllBots() {
    return {
        customer: await getCustomerBot(),
        driver: await getDriverBot(),
        admin: await getAdminBot(),
    };
}
