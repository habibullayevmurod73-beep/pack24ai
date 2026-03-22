import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── POST /api/push/subscribe — Push subscription saqlash ────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { endpoint, keys } = body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json({ error: 'Noto\'g\'ri subscription ma\'lumotlari' }, { status: 400 });
        }

        // Save to DB (PushSubscription model kerak)
        // Hozircha localStorage'da saqlanadi — DB model qo'shilganda uncomment qiling:
        // await prisma.pushSubscription.upsert({
        //     where: { endpoint },
        //     update: { p256dh: keys.p256dh, auth: keys.auth },
        //     create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
        // });

        return NextResponse.json({ success: true, message: 'Obuna muvaffaqiyatli saqlandi' });
    } catch (error) {
        console.error('[push/subscribe]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── DELETE /api/push/subscribe — Push subscription o'chirish ────────────────
export async function DELETE(req: NextRequest) {
    try {
        const { endpoint } = await req.json();
        // await prisma.pushSubscription.deleteMany({ where: { endpoint } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
