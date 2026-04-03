import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Helper: foiz o'zgarish ──────────────────────────────────────────────────
function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10; // 1 decimal
}

// ─── GET /api/admin/reports — Analitika va hisobotlar ────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') ?? '30';
        const days   = parseInt(period);

        // Joriy davr
        const from = new Date();
        from.setDate(from.getDate() - days);

        // Oldingi davr (taqqoslash uchun)
        const prevFrom = new Date();
        prevFrom.setDate(prevFrom.getDate() - days * 2);
        const prevTo = new Date();
        prevTo.setDate(prevTo.getDate() - days);

        const [
            totalOrders,
            newOrders,
            totalRevenue,
            periodOrders,
            prevPeriodOrders,
            topProducts,
            ordersByStatus,
            dailyRevenue,
            // Yangi: takroriy mijozlar
            repeatCustomers,
        ] = await Promise.all([
            // 1. Jami buyurtmalar
            prisma.order.count(),

            // 2. Yangi buyurtmalar (so'nggi 24 soat)
            prisma.order.count({
                where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
            }),

            // 3. Barcha vaqt daromad
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { notIn: ['cancelled', 'draft'] } },
            }),

            // 4. Joriy davr buyurtmalari
            prisma.order.findMany({
                where: { createdAt: { gte: from } },
                orderBy: { createdAt: 'asc' },
                select: { id: true, totalAmount: true, status: true, createdAt: true, contactPhone: true },
            }),

            // 5. Oldingi davr buyurtmalari (trend uchun)
            prisma.order.findMany({
                where: { createdAt: { gte: prevFrom, lt: prevTo } },
                select: { id: true, totalAmount: true, status: true },
            }),

            // 6. Top mahsulotlar
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                _count: { productId: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 10,
            }),

            // 7. Status bo'yicha
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
                where: { createdAt: { gte: from } },
            }),

            // 8. Kunlik daromad
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

            // 9. Takroriy mijozlar (2+ buyurtma)
            prisma.$queryRaw<{ count: number }[]>`
                SELECT COUNT(*) as count FROM (
                    SELECT "contactPhone"
                    FROM "Order"
                    WHERE "contactPhone" IS NOT NULL
                      AND "contactPhone" != ''
                      AND status NOT IN ('draft')
                    GROUP BY "contactPhone"
                    HAVING COUNT(*) >= 2
                ) as repeats
            `,
        ]);

        // ─── Top mahsulotlar details ──────────────────────────────────────
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

        // ─── Kunlik daromad format ────────────────────────────────────────
        const daily = dailyRevenue.map(d => ({
            date:    d.date?.slice(5) ?? '',
            revenue: Number(d.total ?? 0),
            orders:  Number(d.count ?? 0),
        }));

        // ─── Joriy davr summary ───────────────────────────────────────────
        const curCount     = periodOrders.length;
        const curRevenue   = periodOrders.reduce((s: number, o: { totalAmount: number | null }) => s + (o.totalAmount ?? 0), 0);
        const curCompleted = periodOrders.filter((o: { status: string }) => o.status === 'delivered').length;
        const curCancelled = periodOrders.filter((o: { status: string }) => o.status === 'cancelled').length;
        const curConversion = curCount > 0 ? Math.round((curCompleted / curCount) * 100) : 0;

        // ─── Oldingi davr summary ─────────────────────────────────────────
        const prevCount     = prevPeriodOrders.length;
        const prevRevenue   = prevPeriodOrders.reduce((s: number, o: { totalAmount: number | null }) => s + (o.totalAmount ?? 0), 0);
        const prevCompleted = prevPeriodOrders.filter((o: { status: string }) => o.status === 'delivered').length;
        const prevConversion = prevCount > 0 ? Math.round((prevCompleted / prevCount) * 100) : 0;

        // ─── TREND hisoblash ──────────────────────────────────────────────
        const trends = {
            ordersGrowth:     pctChange(curCount, prevCount),
            revenueGrowth:    pctChange(curRevenue, prevRevenue),
            conversionChange: pctChange(curConversion, prevConversion),
        };

        // ─── Yangi metrikalar ─────────────────────────────────────────────
        const aov = curCount > 0 ? Math.round(curRevenue / curCount) : 0; // O'rtacha buyurtma
        const cancelRate = curCount > 0 ? Math.round((curCancelled / curCount) * 100) : 0;
        const repeatCount = Number(repeatCustomers?.[0]?.count ?? 0);

        // Noyob mijozlar soni (telefon bo'yicha)
        const uniquePhones = new Set(
            periodOrders
                .map((o: { contactPhone: string | null }) => o.contactPhone)
                .filter(Boolean)
        ).size;
        const repeatRate = uniquePhones > 0 ? Math.round((repeatCount / uniquePhones) * 100) : 0;

        return NextResponse.json({
            summary: {
                totalOrders,
                newOrders,
                totalRevenue:    totalRevenue._sum.totalAmount ?? 0,
                periodOrders:    curCount,
                periodRevenue:   curRevenue,
                completedOrders: curCompleted,
                conversionRate:  curConversion,
                // Yangi metrikalar
                aov,
                cancelRate,
                repeatRate,
                cancelledOrders: curCancelled,
            },
            trends,
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
