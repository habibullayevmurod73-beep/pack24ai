import { NextResponse } from 'next/server';
import { initCustomerBot } from '@/lib/telegram/customerBot';
import { initDriverBot } from '@/lib/telegram/driverBot';
import { initAdminBot } from '@/lib/telegram/adminBot';
import { getBotStatuses } from '@/lib/telegram/botManager';

export const dynamic = 'force-dynamic';

// ─── GET — Botlar holati ─────────────────────────────────────────────────────
export async function GET() {
    const statuses = await getBotStatuses();
    return NextResponse.json({ ok: true, bots: statuses });
}

// ─── POST — Webhooklarni o'rnatish / polling boshlash ────────────────────────
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { mode = 'webhook', baseUrl } = body as { mode?: string; baseUrl?: string };

        const results: { bot: string; status: string; url?: string }[] = [];

        // ── 1. Customer Bot ──────────────────────────────────────────────
        try {
            const customerBot = await initCustomerBot();
            if (customerBot) {
                if (mode === 'webhook' && baseUrl) {
                    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
                    await customerBot.telegram.setWebhook(webhookUrl);
                    results.push({ bot: 'Customer (@Pack24AI_bot)', status: '✅ Webhook o\'rnatildi', url: webhookUrl });
                } else if (mode === 'polling') {
                    await customerBot.launch({ dropPendingUpdates: true });
                    results.push({ bot: 'Customer (@Pack24AI_bot)', status: '✅ Polling boshlandi' });
                }
            } else {
                results.push({ bot: 'Customer (@Pack24AI_bot)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            results.push({ bot: 'Customer (@Pack24AI_bot)', status: `❌ ${msg}` });
        }

        // ── 2. Driver Bot ────────────────────────────────────────────────
        try {
            const driverBot = await initDriverBot();
            if (driverBot) {
                if (mode === 'webhook' && baseUrl) {
                    const webhookUrl = `${baseUrl}/api/telegram/webhook/driver`;
                    await driverBot.telegram.setWebhook(webhookUrl);
                    results.push({ bot: 'Driver (@pack24MX_bot)', status: '✅ Webhook o\'rnatildi', url: webhookUrl });
                } else if (mode === 'polling') {
                    await driverBot.launch({ dropPendingUpdates: true });
                    results.push({ bot: 'Driver (@pack24MX_bot)', status: '✅ Polling boshlandi' });
                }
            } else {
                results.push({ bot: 'Driver (@pack24MX_bot)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            results.push({ bot: 'Driver (@pack24MX_bot)', status: `❌ ${msg}` });
        }

        // ── 3. Admin Bot ─────────────────────────────────────────────────
        try {
            const adminBot = await initAdminBot();
            if (adminBot) {
                if (mode === 'webhook' && baseUrl) {
                    const webhookUrl = `${baseUrl}/api/telegram/webhook/admin`;
                    await adminBot.telegram.setWebhook(webhookUrl);
                    results.push({ bot: 'Admin (@pack24AUP_bot)', status: '✅ Webhook o\'rnatildi', url: webhookUrl });
                } else if (mode === 'polling') {
                    await adminBot.launch({ dropPendingUpdates: true });
                    results.push({ bot: 'Admin (@pack24AUP_bot)', status: '✅ Polling boshlandi' });
                }
            } else {
                results.push({ bot: 'Admin (@pack24AUP_bot)', status: '⚠️ Token topilmadi' });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            results.push({ bot: 'Admin (@pack24AUP_bot)', status: `❌ ${msg}` });
        }

        // Graceful shutdown (polling rejimda)
        if (mode === 'polling') {
            const shutdown = () => {
                console.log('[Bot Setup] Shutting down bots...');
            };
            process.once('SIGINT', shutdown);
            process.once('SIGTERM', shutdown);
        }

        return NextResponse.json({
            ok: true,
            mode,
            message: mode === 'webhook'
                ? '🌐 Webhooklar o\'rnatildi!'
                : '🔄 Polling boshlandi!',
            bots: results,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}

// ─── DELETE — Webhooklarni o'chirish ─────────────────────────────────────────
export async function DELETE() {
    const results: { bot: string; status: string }[] = [];

    try {
        const customerBot = await initCustomerBot();
        if (customerBot) {
            await customerBot.telegram.deleteWebhook();
            results.push({ bot: 'Customer', status: '✅ Webhook o\'chirildi' });
        }
    } catch { results.push({ bot: 'Customer', status: '❌ Xatolik' }); }

    try {
        const driverBot = await initDriverBot();
        if (driverBot) {
            await driverBot.telegram.deleteWebhook();
            results.push({ bot: 'Driver', status: '✅ Webhook o\'chirildi' });
        }
    } catch { results.push({ bot: 'Driver', status: '❌ Xatolik' }); }

    try {
        const adminBot = await initAdminBot();
        if (adminBot) {
            await adminBot.telegram.deleteWebhook();
            results.push({ bot: 'Admin', status: '✅ Webhook o\'chirildi' });
        }
    } catch { results.push({ bot: 'Admin', status: '❌ Xatolik' }); }

    return NextResponse.json({ ok: true, message: 'Webhooklar o\'chirildi', bots: results });
}
