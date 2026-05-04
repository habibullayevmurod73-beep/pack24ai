import { prisma } from '@/lib/prisma';
import { publishPlatformEvent } from '@/lib/platform/events';

function getRequestStatusEventMeta(status: string) {
    switch (status) {
        case 'dispatched': return { type: 'recycling.request.dispatched', severity: 'info' as const, title: 'Ariza dispatch qilindi' };
        case 'assigned': return { type: 'recycling.driver.assigned', severity: 'info' as const, title: 'Arizaga haydovchi tayinlandi' };
        case 'en_route': return { type: 'recycling.driver.en_route', severity: 'info' as const, title: 'Haydovchi yo\'lga chiqdi' };
        case 'arrived': return { type: 'recycling.driver.arrived', severity: 'info' as const, title: 'Haydovchi yetib keldi' };
        case 'collected': return { type: 'recycling.collection.collected', severity: 'info' as const, title: 'Yig\'ish bajarildi' };
        case 'confirmed': return { type: 'recycling.request.confirmed', severity: 'success' as const, title: 'Ariza tasdiqlandi' };
        case 'completed': return { type: 'recycling.request.completed', severity: 'success' as const, title: 'Ariza yakunlandi' };
        case 'disputed': return { type: 'recycling.request.disputed', severity: 'warning' as const, title: 'Ariza bo\'yicha e\'tiroz tushdi' };
        case 'cancelled': return { type: 'recycling.request.cancelled', severity: 'warning' as const, title: 'Ariza bekor qilindi' };
        default: return { type: 'recycling.request.status_updated', severity: 'info' as const, title: 'Ariza statusi yangilandi' };
    }
}

export async function updateRecycleRequest(
    requestId: number,
    data: {
        status?: string | null;
        supervisorId?: number | null;
        assignedDriverId?: number | null;
        address?: string | null;
        customerTgId?: string | null;
        completedNote?: string | null;
    }
) {
    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (data.supervisorId !== undefined) updateData.supervisorId = data.supervisorId;
    if (data.assignedDriverId !== undefined) updateData.assignedDriverId = data.assignedDriverId;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.customerTgId !== undefined) updateData.customerTgId = data.customerTgId;
    if (data.completedNote !== undefined) updateData.completedNote = data.completedNote;

    if (data.status === 'dispatched') updateData.dispatchedAt = new Date();
    if (data.status === 'assigned') updateData.assignedAt = new Date();
    if (data.status === 'en_route') updateData.driverEnRouteAt = new Date();
    if (data.status === 'arrived') updateData.driverArrivedAt = new Date();
    if (data.status === 'collected') updateData.collectedAt = new Date();
    if (data.status === 'confirmed') updateData.confirmedAt = new Date();
    if (data.status === 'completed') updateData.completedAt = new Date();

    const req = await prisma.recycleRequest.update({
        where: { id: requestId },
        data: updateData,
        include: {
            point: true,
            supervisor: true,
            assignedDriver: true,
        },
    });

    if (data.status) {
        const meta = getRequestStatusEventMeta(data.status);
        await publishPlatformEvent({
            source: 'platform',
            type: meta.type,
            entityType: 'recycle_request',
            entityId: req.id,
            severity: meta.severity,
            title: meta.title,
            message: `Ariza #${req.id} statusi ${data.status} ga o'zgartirildi.`,
            requestId: req.id,
            driverId: req.assignedDriverId ?? undefined,
            supervisorId: req.supervisorId ?? undefined,
            pointId: req.regionId,
            payload: {
                status: data.status,
                completedNote: data.completedNote ?? null,
            },
            notifyAdmins: false,
        });
    }

    return req;
}

export async function deleteRecycleRequest(requestId: number) {
    return prisma.recycleRequest.delete({ where: { id: requestId } });
}

export async function getRecycleRequests() {
    return prisma.recycleRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            point: true,
            supervisor: true,
            assignedDriver: true,
            collections: true,
            complaints: true,
        },
    });
}
