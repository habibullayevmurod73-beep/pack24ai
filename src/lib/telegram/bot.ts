import { Telegraf, Context } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store bot instance to avoid recreating it on every request in development
let botInstance: Telegraf | null = null;

export const getBot = async () => {
    if (botInstance) {
        return botInstance;
    }

    const config = await prisma.telegramConfig.findFirst();

    if (!config || !config.botToken) {
        console.warn('Telegram Bot Token not configured');
        return null;
    }

    const bot = new Telegraf(config.botToken);

    // Middleware to log updates
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`Update ${ctx.update.update_id} processed in ${ms}ms`);
    });

    // Start Command
    bot.start((ctx) => {
        const message = config.welcomeMessage
            .replace('{user}', ctx.from.first_name || 'Mijoz')
            .replace('{bot}', ctx.botInfo.first_name);

        ctx.reply(message, {
            reply_markup: {
                keyboard: [
                    [{
                        text: config.mainButton,
                        web_app: { url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz'}/mobile` }
                    }]
                ],
                resize_keyboard: true
            }
        });
    });

    // Help Command
    bot.help((ctx) => ctx.reply('Men sizga qanday yordam bera olaman?'));

    botInstance = bot;
    return bot;
};

// Reset bot instance (useful if token changes)
export const resetBot = () => {
    botInstance = null;
};
