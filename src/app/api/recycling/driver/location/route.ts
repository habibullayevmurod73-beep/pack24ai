/**
 * POST /api/recycling/driver/location
 * 
 * Haydovchi GPS joylashuvini yangilaydi.
 * Mobil ilova background'dan har 30 sekundda yuboradi.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-driver-secret';

function verifyDriverToken(authHeader: string | null): { driverId: number } | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const [payloadB64, hmac] = token.split('.');
    if (!payloadB64 || !hmac) return null;

    try {
        const payload = Buffer.from(payloadB64, 'base64').toString();
        const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
        if (hmac !== expected) return null;
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    const auth = verifyDriverToken(req.headers.get('authorization'));
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { latitude, longitude } = await req.json();

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return NextResponse.json({ error: 'latitude/longitude kerak' }, { status: 400 });
        }

        await prisma.driver.update({
            where: { id: auth.driverId },
            data: {
                lastLat: latitude,
                lastLng: longitude,
                lastSeenAt: new Date(),
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Driver Location]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
