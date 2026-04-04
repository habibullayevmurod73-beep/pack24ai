import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBot, resetBot } from '@/lib/telegram/bot';

export async function GET() {
    try {
        const config = await prisma.telegramConfig.findFirst();

        // ─── Real DB stats ─────────────────────────────────────────────
        const [
            totalUsers,
            totalOrders,
            totalCollections,
            pendingCollections,
            paidCollections,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.order.count(),
            (prisma as any).recyclingCollection?.count?.() ?? 0,
            (prisma as any).recyclingCollection?.count?.({ where: { isPaid: false, status: 'approved' } }) ?? 0,
            (prisma as any).recyclingCollection?.count?.({ where: { isPaid: true } }) ?? 0,
        ]);

        // ─── Webhook info ───────────────────────────────────────────────
        let webhookInfo = null;
        if (config?.botToken) {
            try {
                const bot = await getBot();
                if (bot) {
                    webhookInfo = await bot.telegram.getWebhookInfo();
                }
            } catch (e) {
                console.error('Webhook info error:', e);
            }
        }

        return NextResponse.json({
            ...(config || {
                botToken: '',
                botUsername: '',
                welcomeMessage: 'Assalomu alaykum! Xush kelibsiz.',
                mainButton: 'Katalog',
                salesChatId: '',
                isActive: false,
            }),
            webhookInfo,
            stats: {
                totalUsers,
                totalOrders,
                totalCollections,
                pendingCollections,
                paidCollections,
            },
        });
    } catch (error) {
        console.error('Config fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { botToken, welcomeMessage, mainButton, salesChatId } = body;

        let config = await prisma.telegramConfig.findFirst();

        if (config) {
            config = await prisma.telegramConfig.update({
                where: { id: config.id },
                data: { botToken, welcomeMessage, mainButton, salesChatId },
            });
        } else {
            config = await prisma.telegramConfig.create({
                data: { botToken, welcomeMessage, mainButton, salesChatId },
            });
        }

        resetBot();

        let botUsername = config.botUsername || 'Noma\'lum';

        if (botToken) {
            try {
                const bot = await getBot();
                if (bot) {
                    const me = await bot.telegram.getMe();
                    botUsername = `@${me.username}`;

                    await prisma.telegramConfig.update({
                        where: { id: config.id },
                        data: { botUsername, isActive: true },
                    });

                    if (process.env.NEXT_PUBLIC_APP_URL) {
                        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
                        await bot.telegram.setWebhook(webhookUrl);
                        console.log(`✅ Webhook set: ${webhookUrl}`);
                    } else {
                        console.warn('⚠️ NEXT_PUBLIC_APP_URL not set — webhook not configured');
                    }
                }
            } catch (err) {
                console.error('Failed to verify bot token:', err);
            }
        }

        return NextResponse.json({ ...config, botUsername });
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
