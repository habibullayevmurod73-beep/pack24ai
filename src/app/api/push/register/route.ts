/**
 * POST /api/push/register
 * 
 * Expo Push Token ro'yxatdan o'tkazish.
 * Mobil ilova ishga tushganda tokenni yuboradi.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { pushToken, userId, driverId, platform, appType } = await request.json();

        if (!pushToken) {
            return NextResponse.json({ error: 'pushToken kerak' }, { status: 400 });
        }

        // Mavjud tokenni yangilash yoki yangi yaratish
        await prisma.pushSubscription.upsert({
            where: { token: pushToken },
            create: {
                token: pushToken,
                userId: userId || null,
                driverId: driverId || null,
                platform: platform || 'unknown',
                appType: appType || 'customer',
                isActive: true,
            },
            update: {
                userId: userId || undefined,
                driverId: driverId || undefined,
                platform: platform || undefined,
                isActive: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Push Register]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
