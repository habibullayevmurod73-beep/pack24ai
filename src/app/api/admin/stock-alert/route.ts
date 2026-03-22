import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD ?? '10');
const TELEGRAM_BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// ─── Telegram alert helper ────────────────────────────────────────────────────
async function sendLowStockAlert(items: { name: string; quantity: number; sku?: string | null }[]) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID || !items.length) return;

    const lines = items.map(i =>
        `  ⚠️ ${i.name}${i.sku ? ` (${i.sku})` : ''} — qoldi: <b>${i.quantity}</b>`
    ).join('\n');

    const text = [
        '📦 <b>Ombor: Kam qolgan mahsulotlar</b>',
        '',
        lines,
        '',
        `Chegara: ${LOW_STOCK_THRESHOLD} dona`,
        `🔗 Admin: ${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/products/warehouse`,
    ].join('\n');

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
        });
    } catch (e) {
        console.error('[LowStock Telegram]', e);
    }
}

// ─── GET /api/admin/stock-alert — Kam qolgan mahsulotlarni tekshirish ─────────
// Bu endpoint cron job yoki qo'lda tekshirish uchun ishlatiladi
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const notify = searchParams.get('notify') === 'true';
        const threshold = parseInt(searchParams.get('threshold') ?? String(LOW_STOCK_THRESHOLD));

        // Inventory checking — agar Inventory model bo'lsa
        let lowStockItems: { id: number; name: string; sku: string | null; quantity: number }[] = [];

        try {
            // Try inventory table first
            const inventoryItems = await (prisma as any).inventory.findMany({
                where: { quantity: { lte: threshold } },
                include: { product: { select: { id: true, name: true, sku: true } } },
                orderBy: { quantity: 'asc' },
                take: 50,
            });

            lowStockItems = inventoryItems.map((i: any) => ({
                id: i.product?.id ?? i.id,
                name: i.product?.name ?? 'Noma\'lum',
                sku: i.product?.sku ?? null,
                quantity: i.quantity,
            }));
        } catch {
            // Fallback: use product stock field if exists
            const products = await prisma.product.findMany({
                where: { status: 'active' },
                select: { id: true, name: true, sku: true },
                take: 100,
            });
            // No stock field — return empty with message
            lowStockItems = [];
            return NextResponse.json({
                message: 'Inventory modeli topilmadi. Warehouse bilan integratsiya qiling.',
                lowStock: [],
                threshold,
            });
        }

        // Send Telegram if requested
        if (notify && lowStockItems.length > 0) {
            await sendLowStockAlert(lowStockItems);
        }

        return NextResponse.json({
            lowStock: lowStockItems,
            count: lowStockItems.length,
            threshold,
            notified: notify && lowStockItems.length > 0,
            checkedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[stock-alert]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── POST /api/admin/stock-alert — Manual alert yuborish ─────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items } = body;

        if (!Array.isArray(items) || !items.length) {
            return NextResponse.json({ error: 'items majburiy' }, { status: 400 });
        }

        await sendLowStockAlert(items);
        return NextResponse.json({ success: true, message: `${items.length} ta mahsulot haqida Telegram xabar yuborildi` });
    } catch (error) {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
