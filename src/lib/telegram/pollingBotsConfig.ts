import type { TelegramRuntimeBot } from './runtime';

/** `/api/telegram/start-polling` va ixtiyoriy dev-auto-polling uchun bir xil ro‘yxat */
export const TELEGRAM_POLLING_BOT_ENTRIES: TelegramRuntimeBot[] = [
    {
        name: '@Pack24AI_bot (Customer)',
        webhookPath: '/api/telegram/webhook',
        init: async () => {
            const { initCustomerBot } = await import('./customerBot');
            return initCustomerBot();
        },
    },
    {
        name: '@pack24MX_bot (Driver)',
        webhookPath: '/api/telegram/webhook/driver',
        init: async () => {
            const { initDriverBot } = await import('./driverBot');
            return initDriverBot();
        },
    },
    {
        name: '@pack24AUP_bot (Admin)',
        webhookPath: '/api/telegram/webhook/admin',
        init: async () => {
            const { initAdminBot } = await import('./adminBot');
            return initAdminBot();
        },
    },
    {
        name: '@pack24admin_bot (HQ Admin)',
        webhookPath: '/api/telegram/webhook/pack24admin',
        init: async () => {
            const { initPack24AdminBot } = await import('./pack24AdminBot');
            return initPack24AdminBot();
        },
    },
];
