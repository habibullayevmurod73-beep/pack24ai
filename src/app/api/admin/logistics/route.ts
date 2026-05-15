import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecycleRequestStatus } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    try {
        const authError = await verifyAdminAuth(request);
        if (authError) {
            return authError;
        }

        // 1. Qabul bazalari (punktlar) — xaritada ko'rsatish uchun
        const points = await prisma.recyclePoint.findMany({
            where: { status: 'active' },
            select: {
                id: true,
                regionUz: true,
                regionRu: true,
                cityUz: true,
                phone: true,
                address: true,
                lat: true,
                lng: true,
                color: true,
                status: true,
                isAccepting: true,
                pricePerKg: true,
                _count: {
                    select: {
                        requests: {
                            where: {
                                status: {
                                    in: [
                                        RecycleRequestStatus.new_,
                                        RecycleRequestStatus.dispatched,
                                        RecycleRequestStatus.assigned,
                                        RecycleRequestStatus.en_route,
                                        RecycleRequestStatus.collecting,
                                    ],
                                },
                            },
                        },
                        supervisors: { where: { isActive: true } },
                        drivers: { where: { isOnline: true } },
                    },
                },
            },
        });

        // 2. Faol arizalar (GPS bilan)
        const requests = await prisma.recycleRequest.findMany({
            where: {
                status: {
                    in: [
                        RecycleRequestStatus.new_,
                        RecycleRequestStatus.dispatched,
                        RecycleRequestStatus.assigned,
                        RecycleRequestStatus.en_route,
                        RecycleRequestStatus.arrived,
                        RecycleRequestStatus.collecting,
                    ],
                },
                pickupLat: { not: null },
                pickupLng: { not: null },
            },
            include: {
                point: {
                    select: { regionUz: true, color: true },
                },
                assignedDriver: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // 3. Haydovchilar — hudud (point) bilan birga
        const drivers = await prisma.driver.findMany({
            where: { isOnline: true },
            select: {
                id: true,
                name: true,
                phone: true,
                status: true,
                lastLat: true,
                lastLng: true,
                lastSeenAt: true,
                pointId: true,
                point: {
                    select: { regionUz: true, color: true, lat: true, lng: true },
                },
                supervisorId: true,
                supervisor: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            points,
            requests,
            drivers,
        });

    } catch (error) {
        console.error('[logistics] GET xatosi:', error);
        return NextResponse.json(
            { error: "Server xatosi" },
            { status: 500 }
        );
    }
}
