import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET /api/admin/reports — Analitika va hisobotlar ────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') ?? '30'; // days
        const days   = parseInt(period);
        const from   = new Date();
        from.setDate(from.getDate() - days);

        const [
            totalOrders,
            newOrders,
            totalRevenue,
            periodOrders,
            topProducts,
            ordersByStatus,
            dailyRevenue,
        ] = await Promise.all([
            // Jami buyurtmalar
            prisma.order.count(),

            // Yangi buyurtmalar (so'nggi 24 soat)
            prisma.order.count({
                where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
            }),

            // Barcha vaqt daromad
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { notIn: ['cancelled', 'draft'] } },
            }),

            // Davr bo'yicha buyurtmalar
            prisma.order.findMany({
                where: { createdAt: { gte: from } },
                orderBy: { createdAt: 'asc' },
                select: { id: true, totalAmount: true, status: true, createdAt: true },
            }),

            // Top mahsulotlar (sotilish bo'yicha)
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                _count: { productId: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 10,
            }),

            // Status bo'yicha buyurtmalar
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
                where: { createdAt: { gte: from } },
            }),

            // Kunlik daromad (so'nggi 14 kun)
            prisma.$queryRaw<{ date: string; total: number; count: number }[]>`
                SELECT
                    DATE("createdAt")::text as date,
                    COALESCE(SUM("totalAmount"), 0) as total,
                    COUNT(*) as count
                FROM "Order"
                WHERE "createdAt" >= NOW() - INTERVAL '14 days'
                  AND status NOT IN ('cancelled', 'draft')
                GROUP BY DATE("createdAt")
                ORDER BY date ASC
            `,
        ]);

        // Top mahsulotlar uchun product details
        const productIds = topProducts.map(p => p.productId).filter(Boolean) as number[];
        const products   = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, price: true, image: true },
        });

        const topProductsWithDetails = topProducts.map(tp => {
            const prod = products.find((p: { id: number; name: string; price: number; image: string | null }) => p.id === tp.productId);
            return {
                productId:  tp.productId,
                name:       prod?.name ?? 'Mahsulot',
                image:      prod?.image ?? null,
                price:      prod?.price ?? 0,
                totalSold:  tp._sum.quantity ?? 0,
                orderCount: tp._count.productId,
            };
        });

        // Kunlik daromad simple format
        const daily = (dailyRevenue as any[]).map(d => ({
            date:    d.date?.slice(5) ?? '', // MM-DD
            revenue: Number(d.total ?? 0),
            orders:  Number(d.count ?? 0),
        }));

        // Period summary
        const periodRevenue    = periodOrders.reduce((s: number, o: { totalAmount: number | null }) => s + (o.totalAmount ?? 0), 0);
        const completedOrders = periodOrders.filter((o: { status: string }) => o.status === 'delivered').length;

        return NextResponse.json({
            summary: {
                totalOrders,
                newOrders,
                totalRevenue:   totalRevenue._sum.totalAmount ?? 0,
                periodOrders:   periodOrders.length,
                periodRevenue,
                completedOrders,
                conversionRate: periodOrders.length > 0
                    ? Math.round((completedOrders / periodOrders.length) * 100)
                    : 0,
            },
            topProducts: topProductsWithDetails,
            ordersByStatus,
            dailyRevenue: daily,
            period: days,
        });
    } catch (error) {
        console.error('[API/admin/reports]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
