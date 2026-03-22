import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getBot, resetBot } from '@/lib/telegram/bot';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const config = await prisma.telegramConfig.findFirst();
        return NextResponse.json(config || {
            botToken: '',
            botUsername: '',
            welcomeMessage: 'Assalomu alaykum! Xush kelibsiz.',
            mainButton: 'Katalog',
            isActive: false
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { botToken, welcomeMessage, mainButton } = body;

        let config = await prisma.telegramConfig.findFirst();

        if (config) {
            config = await prisma.telegramConfig.update({
                where: { id: config.id },
                data: { botToken, welcomeMessage, mainButton }
            });
        } else {
            config = await prisma.telegramConfig.create({
                data: { botToken, welcomeMessage, mainButton }
            });
        }

        // Reset bot instance to use new token
        resetBot();

        // Optionally: Verify token and get username
        if (botToken) {
            try {
                const bot = await getBot();
                if (bot) {
                    const me = await bot.telegram.getMe();
                    await prisma.telegramConfig.update({
                        where: { id: config.id },
                        data: { botUsername: `@${me.username}`, isActive: true }
                    });

                    // Set Webhook automatically if deployed
                    if (process.env.NEXT_PUBLIC_APP_URL) {
                        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
                        await bot.telegram.setWebhook(webhookUrl);
                        console.log(`Webhook set to ${webhookUrl}`);
                    }
                }
            } catch (err) {
                console.error('Failed to verify bot token', err);
                // Don't fail the request, just log
            }
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
