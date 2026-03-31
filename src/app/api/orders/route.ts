import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Telegram helper ──────────────────────────────────────────────────────────
async function sendTelegramNotification(order: {
    id: number;
    customerName: string | null;
    contactPhone: string | null;
    shippingAddress: string | null;
    shippingLocation?: string | null;
    totalAmount: number | null;
    status: string;
    paymentMethod?: string | null;
    deliveryMethod?: string | null;
    items: { quantity: number; price: number; product: { name: string } | null }[];
}) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) return;

    const paymentLabel: Record<string, string> = { click: '🔵 Click', payme: '🟢 Payme', cash: '💵 Naqd pul' };
    const deliveryLabel: Record<string, string> = { courier: '🚚 Kuryer', pickup: '📦 Olib ketish' };

    const itemLines = order.items
        .map(i => `  • ${i.product?.name ?? 'Mahsulot'} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} so'm`)
        .join('\n');

    const text = [
        `🛒 <b>Yangi Buyurtma #${order.id}</b>`,
        '',
        `👤 <b>Mijoz:</b> ${order.customerName ?? 'Noma\'lum'}`,
        `📞 <b>Tel:</b> ${order.contactPhone ?? '-'}`,
        `📍 <b>Manzil:</b> ${order.shippingAddress ?? '-'}`,
        order.shippingLocation ? `🗺️ <b>Xarita:</b> <a href="https://www.google.com/maps?q=${order.shippingLocation}">Lokatsiyani ko'rish</a>` : '',
        `🚀 <b>Yetkazish:</b> ${deliveryLabel[order.deliveryMethod ?? ''] ?? (order.deliveryMethod ?? '-')}`,
        `💳 <b>To'lov:</b> ${paymentLabel[order.paymentMethod ?? ''] ?? (order.paymentMethod ?? '-')}`,
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
            shippingLocation,
            comment,
            deliveryMethod,
            paymentMethod,
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
                order = await prisma.order.update({ where: { id: order.id }, data: { totalAmount: total, items: { create: fItems } }, include: { items: { include: { product: true } } } });
            } else {
                order = await prisma.order.create({ data: { telegramUserId: telegramUserId?.toString(), status: 'draft', totalAmount: total, items: { create: fItems } }, include: { items: { include: { product: true } } } });
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
                shippingLocation: shippingLocation ?? null,
                comment:         comment ?? null,
                deliveryMethod:  deliveryMethod ?? 'courier',
                paymentMethod:   paymentMethod ?? 'cash',
                paymentStatus:   (paymentMethod === 'cash' || !paymentMethod) ? 'pending' : 'awaiting',
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
            shippingLocation: order.shippingLocation,
            totalAmount:     order.totalAmount,
            status:          order.status,
            paymentMethod:   order.paymentMethod,
            deliveryMethod:  order.deliveryMethod,
            items:           order.items.map((i: { quantity: number; price: number; product: { name: string } | null }) => ({ quantity: i.quantity, price: i.price, product: i.product })),
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
        const contactPhone   = searchParams.get('contactPhone');
        const where: Record<string, unknown> = {};
        if (telegramUserId) where.telegramUserId = telegramUserId;
        if (contactPhone)   where.contactPhone = contactPhone;

        // Draft buyurtmalarni ko'rsatmaslik
        if (!telegramUserId) {
            where.status = { not: 'draft' };
        }

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
