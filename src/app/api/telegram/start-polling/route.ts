import { NextResponse } from 'next/server';
import { initCustomerBot } from '@/lib/telegram/customerBot';
import { initDriverBot } from '@/lib/telegram/driverBot';
import { initAdminBot } from '@/lib/telegram/adminBot';

export const dynamic = 'force-dynamic';

// Polling holatini saqlash (process darajasida)
const globalForPolling = globalThis as unknown as { _botPolling?: boolean };

// GET /api/telegram/start-polling — Dev rejimda 3 ta botni polling boshlash
export async function GET(request: Request) {
    // Faqat localhost yoki Bearer token bilan
    const authHeader = request.headers.get('x-admin-token') || request.headers.get('authorization');
    const secret = process.env.ADMIN_SECRET;
    const host = request.headers.get('host') || '';
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

    if (!isLocal && secret && authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (globalForPolling._botPolling) {
        return NextResponse.json({
            ok: true,
            message: '🤖 Botlar allaqachon polling rejimda ishlayapti!',
        });
    }

    const results: { bot: string; status: string }[] = [];

    // ── 1. Customer Bot (@Pack24AI_bot) ──────────────────────────────────
    try {
        const customerBot = await initCustomerBot();
        if (customerBot) {
            // await QILMAYMIZ — launch() bot to'xtaguncha bloklanadi
            // Webhook o'chirib, pollingni fon rejimda ishga tushiramiz
            customerBot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
            customerBot.launch({ dropPendingUpdates: true }).catch((err) => {
                console.error('[Polling] Customer Bot xatolik:', err.message);
            });
            results.push({ bot: '@Pack24AI_bot (Customer)', status: '✅ Ishga tushdi' });
            console.log('[Polling] ✅ Customer Bot polling boshlandi');
        } else {
            results.push({ bot: '@Pack24AI_bot (Customer)', status: '⚠️ Token topilmadi' });
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Polling] Customer Bot xatolik:', msg);
        results.push({ bot: '@Pack24AI_bot (Customer)', status: `❌ ${msg}` });
    }

    // ── 2. Driver Bot (@pack24MX_bot) ─────────────────────────────────────
    try {
        const driverBot = await initDriverBot();
        if (driverBot) {
            driverBot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
            driverBot.launch({ dropPendingUpdates: true }).catch((err) => {
                console.error('[Polling] Driver Bot xatolik:', err.message);
            });
            results.push({ bot: '@pack24MX_bot (Driver)', status: '✅ Ishga tushdi' });
            console.log('[Polling] ✅ Driver Bot polling boshlandi');
        } else {
            results.push({ bot: '@pack24MX_bot (Driver)', status: '⚠️ Token topilmadi' });
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Polling] Driver Bot xatolik:', msg);
        results.push({ bot: '@pack24MX_bot (Driver)', status: `❌ ${msg}` });
    }

    // ── 3. Admin Bot (@pack24AUP_bot) ─────────────────────────────────────
    try {
        const adminBot = await initAdminBot();
        if (adminBot) {
            adminBot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
            adminBot.launch({ dropPendingUpdates: true }).catch((err) => {
                console.error('[Polling] Admin Bot xatolik:', err.message);
            });
            results.push({ bot: '@pack24AUP_bot (Admin)', status: '✅ Ishga tushdi' });
            console.log('[Polling] ✅ Admin Bot polling boshlandi');
        } else {
            results.push({ bot: '@pack24AUP_bot (Admin)', status: '⚠️ Token topilmadi' });
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Polling] Admin Bot xatolik:', msg);
        results.push({ bot: '@pack24AUP_bot (Admin)', status: `❌ ${msg}` });
    }

    globalForPolling._botPolling = true;

    process.once('SIGINT', () => { globalForPolling._botPolling = false; });
    process.once('SIGTERM', () => { globalForPolling._botPolling = false; });

    return NextResponse.json({
        ok: true,
        message: '🤖 Barcha botlar polling rejimda ishga tushdi!',
        bots: results,
    });
}
