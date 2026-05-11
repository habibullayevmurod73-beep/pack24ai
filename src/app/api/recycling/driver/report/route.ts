/**
 * GET /api/recycling/driver/report
 * 
 * Haydovchi kunlik/haftalik hisoboti.
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
    } catch { return null; }
}

export async function GET(req: NextRequest) {
    const auth = verifyDriverToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const [today, week, total] = await Promise.all([
            prisma.recycleCollection.aggregate({
                where: { driverId: auth.driverId, confirmedAt: { gte: todayStart } },
                _count: true,
                _sum: { weight: true, totalPrice: true },
            }),
            prisma.recycleCollection.aggregate({
                where: { driverId: auth.driverId, confirmedAt: { gte: weekStart } },
                _count: true,
                _sum: { weight: true, totalPrice: true },
            }),
            prisma.recycleCollection.aggregate({
                where: { driverId: auth.driverId },
                _count: true,
                _sum: { weight: true, totalPrice: true },
            }),
        ]);

        // Haftalik kunlik statistika
        const dailyStats = await prisma.recycleCollection.groupBy({
            by: ['confirmedAt'],
            where: { driverId: auth.driverId, confirmedAt: { gte: weekStart } },
            _sum: { weight: true },
            _count: true,
        });

        return NextResponse.json({
            success: true,
            today: {
                count: today._count,
                weight: today._sum.weight || 0,
                revenue: today._sum.totalPrice || 0,
            },
            week: {
                count: week._count,
                weight: week._sum.weight || 0,
                revenue: week._sum.totalPrice || 0,
            },
            total: {
                count: total._count,
                weight: total._sum.weight || 0,
                revenue: total._sum.totalPrice || 0,
            },
            dailyStats,
        });
    } catch (error) {
        console.error('[Driver Report]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
