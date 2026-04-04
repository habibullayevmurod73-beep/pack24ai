import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET /api/admin/customers/analytics ──────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = parseInt(searchParams.get('period') ?? '90');
        const from = new Date();
        from.setDate(from.getDate() - period);

        // 1. Umumiy mijozlar statistikasi
        const [totalCustomers, newCustomers, customersByType, customersByGroup] = await Promise.all([
            prisma.user.count({ where: { role: 'user' } }),
            prisma.user.count({ where: { role: 'user', createdAt: { gte: from } } }),
            prisma.user.groupBy({
                by: ['customerType'],
                where: { role: 'user' },
                _count: { customerType: true },
            }),
            prisma.user.groupBy({
                by: ['customerGroup'],
                where: { role: 'user' },
                _count: { customerGroup: true },
            }),
        ]);

        // 2. Top mijozlar — eng ko'p buyurtma berganlar
        const topCustomersByOrders = await prisma.$queryRaw<{
            phone: string;
            name: string;
            total_orders: number;
            total_revenue: number;
        }[]>`
            SELECT
                o."contactPhone" as phone,
                MAX(o."customerName") as name,
                COUNT(*)::int as total_orders,
                COALESCE(SUM(o."totalAmount"), 0)::float as total_revenue
            FROM "Order" o
            WHERE o."contactPhone" IS NOT NULL
              AND o."contactPhone" != ''
              AND o.status NOT IN ('draft', 'cancelled')
            GROUP BY o."contactPhone"
            ORDER BY total_revenue DESC
            LIMIT 10
        `;

        // 3. Churn rate — 60+ kun buyurtma bermagan, lekin ilgari faol
        const churnData = await prisma.$queryRaw<{ churned: number; active: number }[]>`
            WITH customer_activity AS (
                SELECT
                    "contactPhone",
                    MAX("createdAt") as last_order
                FROM "Order"
                WHERE "contactPhone" IS NOT NULL
                  AND "contactPhone" != ''
                  AND status NOT IN ('draft')
                GROUP BY "contactPhone"
            )
            SELECT
                COUNT(CASE WHEN last_order < NOW() - INTERVAL '60 days' THEN 1 END)::int as churned,
                COUNT(CASE WHEN last_order >= NOW() - INTERVAL '60 days' THEN 1 END)::int as active
            FROM customer_activity
        `;

        // 4. Kunlik yangi mijozlar (ro'yxatdan o'tganlar)
        const dailyNewCustomers = await prisma.$queryRaw<
            { date: string; count: number }[]
        >`
            SELECT
                DATE("createdAt")::text as date,
                COUNT(*)::int as count
            FROM "User"
            WHERE role = 'user'
              AND "createdAt" >= NOW() - INTERVAL '30 days'
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

        // 5. RFM Segmentatsiya (soddalashtirilgan)
        const rfmData = await prisma.$queryRaw<{
            phone: string;
            recency_days: number;
            frequency: number;
            monetary: number;
        }[]>`
            SELECT
                "contactPhone" as phone,
                EXTRACT(DAY FROM NOW() - MAX("createdAt"))::int as recency_days,
                COUNT(*)::int as frequency,
                COALESCE(SUM("totalAmount"), 0)::float as monetary
            FROM "Order"
            WHERE "contactPhone" IS NOT NULL
              AND "contactPhone" != ''
              AND status NOT IN ('draft', 'cancelled')
            GROUP BY "contactPhone"
            HAVING COUNT(*) >= 1
        `;

        // RFM segmentlarga ajratish
        const segments = {
            champions: 0,    // Yaqinda + ko'p + yuqori summa
            loyal: 0,        // Ko'p buyurtma
            atRisk: 0,       // Uzoq vaqt oldin + ko'p edi
            newCustomers: 0, // Yaqinda + 1 buyurtma
            lost: 0,         // Juda uzoq + kam
        };

        for (const c of rfmData) {
            if (c.recency_days <= 30 && c.frequency >= 3) segments.champions++;
            else if (c.frequency >= 3) segments.loyal++;
            else if (c.recency_days > 60 && c.frequency >= 2) segments.atRisk++;
            else if (c.recency_days <= 30 && c.frequency === 1) segments.newCustomers++;
            else if (c.recency_days > 90) segments.lost++;
            else segments.loyal++;
        }

        // 6. Avg LTV
        const avgLtv = rfmData.length > 0
            ? Math.round(rfmData.reduce((s, c) => s + c.monetary, 0) / rfmData.length)
            : 0;

        const churned = Number(churnData?.[0]?.churned ?? 0);
        const activeCustomers = Number(churnData?.[0]?.active ?? 0);
        const churnRate = (churned + activeCustomers) > 0
            ? Math.round((churned / (churned + activeCustomers)) * 100)
            : 0;

        return NextResponse.json({
            summary: {
                totalCustomers,
                newCustomers,
                activeCustomers,
                churnRate,
                avgLtv,
            },
            customersByType: customersByType.map(c => ({
                type: c.customerType,
                count: c._count.customerType,
            })),
            customersByGroup: customersByGroup.map(c => ({
                group: c.customerGroup,
                count: c._count.customerGroup,
            })),
            topCustomers: topCustomersByOrders.map(c => ({
                phone: c.phone,
                name: c.name,
                orders: Number(c.total_orders),
                revenue: Number(c.total_revenue),
            })),
            segments,
            dailyNewCustomers: dailyNewCustomers.map(d => ({
                date: d.date?.slice(5) ?? '',
                count: Number(d.count),
            })),
        });
    } catch (error) {
        console.error('[API/admin/customers/analytics]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
