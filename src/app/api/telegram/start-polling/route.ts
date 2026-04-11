import { NextResponse } from 'next/server';
import { initCustomerBot } from '@/lib/telegram/customerBot';
import { initDriverBot } from '@/lib/telegram/driverBot';
import { initAdminBot } from '@/lib/telegram/adminBot';

export const dynamic = 'force-dynamic';

// Polling holatini saqlash
let isPolling = false;

// GET /api/telegram/start-polling — Dev rejimda 3 ta botni polling boshlash
export async function GET() {
    if (isPolling) {
        return NextResponse.json({
            ok: true,
            message: '🤖 Botlar allaqachon polling rejimda ishlayapti!',
        });
    }

    const results: { bot: string; status: string }[] = [];

    try {
        // ── 1. Customer Bot (@Pack24AI_bot) ──────────────────────────────
        try {
            const customerBot = await initCustomerBot();
            if (customerBot) {
                await customerBot.launch({ dropPendingUpdates: true });
                results.push({ bot: '@Pack24AI_bot (Customer)', status: '✅ Ishga tushdi' });
                console.log('[Polling] ✅ Customer Bot ishga tushdi');
            } else {
                results.push({ bot: '@Pack24AI_bot (Customer)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: any) {
            console.error('[Polling] Customer Bot xatolik:', err.message);
            results.push({ bot: '@Pack24AI_bot (Customer)', status: `❌ ${err.message}` });
        }

        // ── 2. Driver Bot (@pack24MX_bot) ────────────────────────────────
        try {
            const driverBot = await initDriverBot();
            if (driverBot) {
                await driverBot.launch({ dropPendingUpdates: true });
                results.push({ bot: '@pack24MX_bot (Driver)', status: '✅ Ishga tushdi' });
                console.log('[Polling] ✅ Driver Bot ishga tushdi');
            } else {
                results.push({ bot: '@pack24MX_bot (Driver)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: any) {
            console.error('[Polling] Driver Bot xatolik:', err.message);
            results.push({ bot: '@pack24MX_bot (Driver)', status: `❌ ${err.message}` });
        }

        // ── 3. Admin Bot (@pack24AUP_bot) ────────────────────────────────
        try {
            const adminBot = await initAdminBot();
            if (adminBot) {
                await adminBot.launch({ dropPendingUpdates: true });
                results.push({ bot: '@pack24AUP_bot (Admin)', status: '✅ Ishga tushdi' });
                console.log('[Polling] ✅ Admin Bot ishga tushdi');
            } else {
                results.push({ bot: '@pack24AUP_bot (Admin)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: any) {
            console.error('[Polling] Admin Bot xatolik:', err.message);
            results.push({ bot: '@pack24AUP_bot (Admin)', status: `❌ ${err.message}` });
        }

        isPolling = true;

        // Graceful shutdown
        const shutdown = () => {
            console.log('[Polling] Shutting down bots...');
            isPolling = false;
        };
        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);

        return NextResponse.json({
            ok: true,
            message: '🤖 Barcha botlar polling rejimda ishga tushdi!',
            bots: results,
        });
    } catch (error: any) {
        console.error('[Polling] Umumiy xatolik:', error);
        return NextResponse.json({
            ok: false,
            error: error.message || 'Botlarni ishga tushirishda xatolik',
            bots: results,
        }, { status: 500 });
    }
}
