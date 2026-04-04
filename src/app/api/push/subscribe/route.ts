import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── POST /api/push/subscribe — Push subscription saqlash ────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { endpoint, keys, userId } = body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { error: "Noto'g'ri subscription ma'lumotlari" },
                { status: 400 }
            );
        }

        const userAgent = req.headers.get('user-agent') ?? undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = prisma as any;
        // Upsert: mavjud bo'lsa yangilaydi, yo'q bo'lsa yaratadi
        const subscription = await db.pushSubscription.upsert({
            where: { endpoint },
            update: {
                p256dh:    keys.p256dh,
                auth:      keys.auth,
                isActive:  true,
                userAgent: userAgent,
                ...(userId ? { userId: Number(userId) } : {}),
            },
            create: {
                endpoint,
                p256dh:    keys.p256dh,
                auth:      keys.auth,
                userAgent: userAgent,
                isActive:  true,
                ...(userId ? { userId: Number(userId) } : {}),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Push subscription saqlandi',
            id: subscription.id,
        });
    } catch (error) {
        console.error('[push/subscribe POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── DELETE /api/push/subscribe — Push subscription o'chirish ────────────────
export async function DELETE(req: NextRequest) {
    try {
        const { endpoint } = await req.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'endpoint majburiy' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = prisma as any;
        await db.pushSubscription.updateMany({
            where:  { endpoint },
            data:   { isActive: false },
        });

        return NextResponse.json({ success: true, message: "Subscription o'chirildi" });
    } catch (error) {
        console.error('[push/subscribe DELETE]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/push/subscribe — VAPID public key olish ────────────────────────
export async function GET() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        return NextResponse.json(
            { error: 'VAPID keys sozlanmagan. VAPID_PUBLIC_KEY env ni qo\'ying.' },
            { status: 503 }
        );
    }

    return NextResponse.json({ vapidPublicKey });
}
