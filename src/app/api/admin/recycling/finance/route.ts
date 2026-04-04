import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/recycling/finance — Moliyaviy hisobot
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = parseInt(searchParams.get('period') ?? '30');

        const from = new Date();
        from.setDate(from.getDate() - period);

        // 1. Umumiy ko'rsatkichlar
        const [totalCollections, periodCollections, pendingPayments, allCollections] = await Promise.all([
            prisma.recycleCollection.count(),
            prisma.recycleCollection.count({ where: { createdAt: { gte: from } } }),
            prisma.recycleCollection.count({ where: { paymentStatus: 'pending' } }),
            prisma.recycleCollection.findMany({
                where: { createdAt: { gte: from } },
                include: { driver: true, request: { include: { point: true } } },
            }),
        ]);

        // Agregatlar
        const totalWeight = allCollections.reduce((s, c) => s + c.actualWeight, 0);
        const totalEffectiveWeight = allCollections.reduce((s, c) => s + c.effectiveWeight, 0);
        const totalAmount = allCollections.reduce((s, c) => s + c.totalAmount, 0);
        const totalPaidToDrivers = allCollections.reduce((s, c) => s + (c.paymentToDriver ?? 0), 0);
        const totalPaidToCustomers = allCollections.reduce((s, c) => s + (c.paymentToCustomer ?? 0), 0);
        const avgDiscount = allCollections.length > 0
            ? allCollections.reduce((s, c) => s + c.discountPercent, 0) / allCollections.length
            : 0;

        // 2. Haydovchi bo'yicha hisobot
        const driverStats: Record<number, {
            name: string; phone: string;
            collections: number; totalWeight: number; totalAmount: number; paid: number;
        }> = {};
        for (const c of allCollections) {
            if (!driverStats[c.driverId]) {
                driverStats[c.driverId] = {
                    name: c.driver.name,
                    phone: c.driver.phone,
                    collections: 0, totalWeight: 0, totalAmount: 0, paid: 0,
                };
            }
            driverStats[c.driverId].collections++;
            driverStats[c.driverId].totalWeight += c.actualWeight;
            driverStats[c.driverId].totalAmount += c.totalAmount;
            driverStats[c.driverId].paid += (c.paymentToDriver ?? 0);
        }

        // 3. Hudud (baza) bo'yicha hisobot
        const pointStats: Record<number, {
            name: string; collections: number; totalWeight: number; totalAmount: number;
        }> = {};
        for (const c of allCollections) {
            const point = c.request.point;
            if (!point) continue;
            if (!pointStats[point.id]) {
                pointStats[point.id] = {
                    name: point.regionUz, collections: 0, totalWeight: 0, totalAmount: 0,
                };
            }
            pointStats[point.id].collections++;
            pointStats[point.id].totalWeight += c.actualWeight;
            pointStats[point.id].totalAmount += c.totalAmount;
        }

        // 4. Kunlik hisobot (so'nggi 14 kun)
        const dailyMap: Record<string, { weight: number; amount: number; count: number }> = {};
        for (const c of allCollections) {
            const date = c.createdAt.toISOString().slice(0, 10);
            if (!dailyMap[date]) dailyMap[date] = { weight: 0, amount: 0, count: 0 };
            dailyMap[date].weight += c.actualWeight;
            dailyMap[date].amount += c.totalAmount;
            dailyMap[date].count++;
        }
        const dailyReport = Object.entries(dailyMap)
            .map(([date, d]) => ({ date: date.slice(5), ...d }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 5. Material turlari bo'yicha
        const materialStats: Record<string, { count: number; weight: number; amount: number }> = {};
        for (const c of allCollections) {
            const mat = c.materialType || 'noma\'lum';
            if (!materialStats[mat]) materialStats[mat] = { count: 0, weight: 0, amount: 0 };
            materialStats[mat].count++;
            materialStats[mat].weight += c.actualWeight;
            materialStats[mat].amount += c.totalAmount;
        }

        return NextResponse.json({
            summary: {
                totalCollections,
                periodCollections,
                pendingPayments,
                totalWeight: Math.round(totalWeight * 10) / 10,
                totalEffectiveWeight: Math.round(totalEffectiveWeight * 10) / 10,
                totalAmount: Math.round(totalAmount),
                totalPaidToDrivers: Math.round(totalPaidToDrivers),
                totalPaidToCustomers: Math.round(totalPaidToCustomers),
                avgDiscount: Math.round(avgDiscount * 10) / 10,
            },
            byDriver: Object.values(driverStats).sort((a, b) => b.totalAmount - a.totalAmount),
            byPoint: Object.values(pointStats).sort((a, b) => b.totalAmount - a.totalAmount),
            byMaterial: Object.entries(materialStats).map(([material, d]) => ({ material, ...d })),
            dailyReport,
            period,
        });
    } catch (error) {
        console.error('[Finance GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
