import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET /api/admin/notifications — Yangi bildirishnomalar ───────────────────
// Admin panel har 30 sekundda bu endpointni polling qiladi
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const since = searchParams.get('since');
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 60 * 1000); // last 60s

        const [newOrders, newOrdersCount] = await Promise.all([
            prisma.order.findMany({
                where: {
                    status: 'new',
                    createdAt: { gte: sinceDate },
                },
                select: {
                    id: true,
                    customerName: true,
                    contactPhone: true,
                    totalAmount: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.order.count({ where: { status: 'new' } }),
        ]);

        return NextResponse.json({
            newOrders,
            newOrdersCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[API/admin/notifications]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
