/**
 * GET /api/driver/points
 *
 * Haydovchiga ko'rinadigan yig'ish punktlari ro'yxati.
 * Xaritada ko'rsatish uchun lat/lng koordinatalari bilan qaytaradi.
 * Driver token bilan autentifikatsiya qilinadi.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDriverToken } from '@/lib/auth/verifyDriverToken';

export async function GET(request: Request) {
    // Driver token tekshirish
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
        return NextResponse.json({ error: 'Token kerak' }, { status: 401 });
    }

    const result = await verifyDriverToken(token);
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 401 });
    }

    try {
        // Haydovchini topish (qaysi point ga tayinlangan)
        const driver = await prisma.driver.findUnique({
            where: { id: result.driverId },
            select: { pointId: true, status: true },
        });

        if (!driver) {
            return NextResponse.json({ error: 'Haydovchi topilmadi' }, { status: 404 });
        }

        // Barcha aktiv punktlarni olish (koordinatalar bilan)
        const points = await prisma.recyclePoint.findMany({
            where: {
                status: 'active',
            },
            select: {
                id: true,
                regionUz: true,
                regionRu: true,
                cityUz: true,
                cityRu: true,
                phone: true,
                lat: true,
                lng: true,
                pricePerKg: true,
                address: true,
                workingHours: true,
            },
            orderBy: { regionUz: 'asc' },
        });

        return NextResponse.json({
            ok: true,
            points,
            myPointId: driver.pointId,
        });

    } catch (error) {
        console.error('[Driver Points API]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
