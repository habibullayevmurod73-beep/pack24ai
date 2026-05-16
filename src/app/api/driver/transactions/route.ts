/**
 * GET /api/driver/transactions — Tranzaksiyalar ro'yxati
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-driver-secret';

function parseToken(authHeader: string | null): { driverId: number } | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const parts = authHeader.slice(7).split('.');
    if (parts.length !== 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const hmac = crypto.createHmac('sha256', TOKEN_SECRET)
            .update(JSON.stringify({ driverId: payload.driverId, identifier: payload.identifier, role: payload.role, ts: payload.ts }))
            .digest('hex');
        return parts[1] === hmac ? { driverId: payload.driverId } : null;
    } catch { return null; }
}

export async function GET(req: NextRequest) {
    const auth = parseToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await prisma.driverTransaction.findMany({
        where: { driverId: auth.driverId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    // Balans hisoblash
    const earnings = await prisma.driverTransaction.aggregate({
        where: { driverId: auth.driverId, type: 'earning', status: 'completed' },
        _sum: { amount: true },
    });
    const withdrawals = await prisma.driverTransaction.aggregate({
        where: { driverId: auth.driverId, type: 'withdrawal', status: 'completed' },
        _sum: { amount: true },
    });

    const balance = (earnings._sum.amount || 0) - (withdrawals._sum.amount || 0);

    return NextResponse.json({
        balance,
        totalEarnings: earnings._sum.amount || 0,
        totalWithdrawals: withdrawals._sum.amount || 0,
        transactions,
    });
}
