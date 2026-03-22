import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Telegram helper ──────────────────────────────────────────────────────────
async function sendTelegramNotification(order: {
    id: number;
    customerName: string | null;
    contactPhone: string | null;
    shippingAddress: string | null;
    totalAmount: number | null;
    status: string;
    items: { quantity: number; price: number; product: { name: string } | null }[];
}) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) return;

    const itemLines = order.items
        .map(i => `  • ${i.product?.name ?? 'Mahsulot'} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} so'm`)
        .join('\n');

    const text = [
        `🛒 <b>Yangi Buyurtma #${order.id}</b>`,
        '',
        `👤 <b>Mijoz:</b> ${order.customerName ?? 'Noma\'lum'}`,
        `📞 <b>Tel:</b> ${order.contactPhone ?? '-'}`,
        `📍 <b>Manzil:</b> ${order.shippingAddress ?? '-'}`,
        '',
        `<b>Mahsulotlar:</b>`,
        itemLines,
        '',
        `💰 <b>Jami: ${(order.totalAmount ?? 0).toLocaleString()} so'm</b>`,
        `📌 Status: Yangi`,
        '',
        `🔗 Admin: ${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/orders`,
    ].join('\n');

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
        });
    } catch (e) {
        console.error('[Telegram]', e);
    }
}

// ─── POST /api/orders — Buyurtma yaratish ────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            telegramUserId,
            customerName,
            contactPhone,
            shippingAddress,
            comment,
            deliveryMethod,
            status = 'new',
            totalAmount,
            items,
        } = body;

        if (!items?.length) {
            return NextResponse.json({ error: 'items majburiy' }, { status: 400 });
        }

        // Draft mode (old cart flow)
        if (telegramUserId && !customerName) {
            let total = 0;
            const fItems: { productId: number; quantity: number; price: number }[] = [];
            for (const item of items) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                if (product) {
                    total += product.price * item.quantity;
                    fItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
                }
            }
            let order = await prisma.order.findFirst({ where: { telegramUserId: telegramUserId?.toString(), status: 'draft' } });
            if (order) {
                await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
                order = await prisma.order.update({ where: { id: order.id }, data: { totalAmount: total, items: { create: fItems } }, include: { items: { include: { product: true } } } as any });
            } else {
                order = await prisma.order.create({ data: { telegramUserId: telegramUserId?.toString(), status: 'draft', totalAmount: total, items: { create: fItems } }, include: { items: { include: { product: true } } } as any });
            }
            return NextResponse.json(order);
        }

        // Full checkout order
        let computedTotal = totalAmount ?? 0;
        const orderItems = (items as { productId: number; quantity: number; price: number }[]).map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
        }));

        if (!computedTotal) {
            computedTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        }

        const order = await prisma.order.create({
            data: {
                telegramUserId: telegramUserId?.toString() ?? null,
                customerName:    customerName ?? null,
                contactPhone:    contactPhone ?? null,
                shippingAddress: shippingAddress ?? null,
                comment:         comment ?? null,
                deliveryMethod:  deliveryMethod ?? 'courier',
                status,
                totalAmount: computedTotal,
                items: { create: orderItems },
            },
            include: { items: { include: { product: { select: { name: true } } } } },
        });

        // Non-blocking Telegram notification
        sendTelegramNotification({
            id:              order.id,
            customerName:    order.customerName,
            contactPhone:    order.contactPhone,
            shippingAddress: order.shippingAddress,
            totalAmount:     order.totalAmount,
            status:          order.status,
            items:           (order.items as any[]).map(i => ({ quantity: i.quantity, price: i.price, product: i.product })),
        }).catch(console.error);

        return NextResponse.json(order);
    } catch (error) {
        console.error('[POST /api/orders]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/orders — Buyurtmalarni olish ───────────────────────────────────
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const telegramUserId = searchParams.get('telegramUserId');
        const where: Record<string, unknown> = {};
        if (telegramUserId) where.telegramUserId = telegramUserId;

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
