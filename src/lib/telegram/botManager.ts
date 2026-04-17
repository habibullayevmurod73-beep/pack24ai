import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';

// ─── Bot instancelari (Hot-reload himoyasi bilan) ─────────────────────────────
const globalForBots = globalThis as unknown as {
    customerBot?: Telegraf | null;
    driverBot?: Telegraf | null;
    adminBot?: Telegraf | null;
};

let customerBot = globalForBots.customerBot || null;
let driverBot = globalForBots.driverBot || null;
let adminBot = globalForBots.adminBot || null;

// ─── Token olish yordamchisi ──────────────────────────────────────────────────
async function getCustomerToken(): Promise<string | null> {
    // 1. Env dan
    if (process.env.CUSTOMER_BOT_TOKEN) return process.env.CUSTOMER_BOT_TOKEN;
    // 2. Bazadan (fallback)
    const config = await prisma.telegramConfig.findFirst();
    return config?.botToken || null;
}

// ─── Asosiy mijozlar botini olish ─────────────────────────────────────────────
export async function getCustomerBot(): Promise<Telegraf | null> {
    if (customerBot) return customerBot;

    const token = await getCustomerToken();
    if (!token) {
        console.warn('[BotManager] Customer Bot Token topilmadi');
        return null;
    }

    customerBot = new Telegraf(token);
    if (process.env.NODE_ENV !== 'production') globalForBots.customerBot = customerBot;
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
    if (process.env.NODE_ENV !== 'production') globalForBots.driverBot = driverBot;
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
    if (process.env.NODE_ENV !== 'production') globalForBots.adminBot = adminBot;
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

// ─── Bot tokenlar ro'yxati (admin sahifa uchun) ──────────────────────────────
export async function getBotStatuses() {
    const customerToken = await getCustomerToken();
    return [
        {
            name: 'Customer Bot',
            username: '@Pack24AI_bot',
            envKey: 'CUSTOMER_BOT_TOKEN',
            hasToken: !!customerToken,
            description: 'Mijozlar — katalog, makulatura ariza, AI assistent',
        },
        {
            name: 'Driver Bot',
            username: '@pack24MX_bot',
            envKey: 'DRIVER_BOT_TOKEN',
            hasToken: !!process.env.DRIVER_BOT_TOKEN,
            description: 'Haydovchilar — topshiriqlar, kalkulyator, online/offline',
        },
        {
            name: 'Admin Bot',
            username: '@pack24AUP_bot',
            envKey: 'ADMIN_BOT_TOKEN',
            hasToken: !!process.env.ADMIN_BOT_TOKEN,
            description: 'Masullar — arizalar, haydovchi tayinlash, to\'lovlar',
        },
    ];
}
