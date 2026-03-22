import { NextResponse } from 'next/server';
import { getBot } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

// Handle POST requests from Telegram Webhook
export async function POST(request: Request) {
    try {
        const bot = await getBot();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not configured' }, { status: 503 });
        }

        const body = await request.json();

        // Process the update
        await bot.handleUpdate(body);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error handling Telegram webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Handle GET requests (verify webhook status)
export async function GET() {
    return NextResponse.json({ status: 'Telegram Webhook Endpoint is Active' });
}
