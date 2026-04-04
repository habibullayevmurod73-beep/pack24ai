import { NextResponse } from 'next/server';
import { startPolling } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

// GET /api/telegram/start-polling — Dev rejimda polling boshlash
export async function GET() {
    try {
        await startPolling();
        return NextResponse.json({ 
            ok: true, 
            message: '🤖 Bot polling rejimda ishga tushdi!' 
        });
    } catch (error: any) {
        console.error('Polling start error:', error);
        return NextResponse.json({ 
            ok: false, 
            error: error.message || 'Bot ishga tushirishda xatolik' 
        }, { status: 500 });
    }
}
