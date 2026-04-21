import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/adminAuth';

// ─── Yordamchi: web-push paketini dinamik yuklash ─────────────────────────────
// npm install web-push @types/web-push — keyin to'liq ishlaydi
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebPushLib = any;

async function getWebPush(): Promise<WebPushLib | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('web-push') as WebPushLib;
    } catch {
        return null;
    }
}

interface PushSub {
    endpoint: string;
    p256dh:   string;
    auth:     string;
}

// ─── POST /api/push/send — Barcha yoki muayyan userlarga push yuborish ────────
// Body: { title, body, url?, icon?, userId? }
export async function POST(req: NextRequest) {
    const authError = await verifyAdminAuth(req);
    if (authError) {
        return authError;
    }

    try {
        const { title, body, url = '/', icon, userId } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'title va body majburiy' }, { status: 400 });
        }

        const webPush = await getWebPush();
        if (!webPush) {
            return NextResponse.json(
                { error: "web-push o'rnatilmagan. Terminalda: npm install web-push @types/web-push" },
                { status: 503 }
            );
        }

        const vapidPublicKey  = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidEmail      = process.env.VAPID_EMAIL || 'mailto:admin@pack24.uz';

        if (!vapidPublicKey || !vapidPrivateKey) {
            return NextResponse.json(
                { error: 'VAPID keys sozlanmagan. .env ga VAPID_PUBLIC_KEY va VAPID_PRIVATE_KEY qo\'ying.' },
                { status: 503 }
            );
        }

        webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

        // Prisma client regeneratsiyadan keyin ishlaydi
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = prisma as any;
        const where = {
            isActive: true,
            ...(userId ? { userId: Number(userId) } : {}),
        };

        const subscriptions: PushSub[] = await db.pushSubscription.findMany({ where });

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: "Obunachi yo'q" });
        }

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
        });

        const results = await Promise.allSettled(
            subscriptions.map((sub: PushSub) =>
                webPush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                ).catch(async (err: { statusCode?: number }) => {
                    // 410 Gone — subscription eskirgan, o'chiramiz
                    if (err?.statusCode === 410) {
                        await db.pushSubscription.updateMany({
                            where: { endpoint: sub.endpoint },
                            data:  { isActive: false },
                        });
                    }
                    throw err;
                })
            )
        );

        const sent   = results.filter((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled').length;
        const failed = results.filter((r: PromiseSettledResult<unknown>) => r.status === 'rejected').length;

        return NextResponse.json({ success: true, sent, failed, total: subscriptions.length });
    } catch (error) {
        console.error('[push/send]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/push/send — Subscription statistika ────────────────────────────
export async function GET(req: NextRequest) {
    const authError = await verifyAdminAuth(req);
    if (authError) {
        return authError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    try {
        const [total, active] = await Promise.all([
            db.pushSubscription.count(),
            db.pushSubscription.count({ where: { isActive: true } }),
        ]);
        return NextResponse.json({ total, active, inactive: total - active });
    } catch {
        // Prisma client regeneratsiya qilinmagan bo'lishi mumkin
        return NextResponse.json(
            { error: "Prisma regeneratsiya kerak. npm run db:push ishga tushiring." },
            { status: 503 }
        );
    }
}
