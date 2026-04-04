import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        // Status yangilash
        if (body.status) updateData.status = body.status;

        // Dispatch ma'lumotlari
        if (body.supervisorId !== undefined) updateData.supervisorId = body.supervisorId ? Number(body.supervisorId) : null;
        if (body.assignedDriverId !== undefined) updateData.assignedDriverId = body.assignedDriverId ? Number(body.assignedDriverId) : null;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.customerTgId !== undefined) updateData.customerTgId = body.customerTgId;
        if (body.completedNote !== undefined) updateData.completedNote = body.completedNote;

        // Vaqt tamg'alari
        if (body.status === 'dispatched') updateData.dispatchedAt = new Date();
        if (body.status === 'assigned') updateData.assignedAt = new Date();
        if (body.status === 'en_route') updateData.driverEnRouteAt = new Date();
        if (body.status === 'arrived') updateData.driverArrivedAt = new Date();
        if (body.status === 'collected') updateData.collectedAt = new Date();
        if (body.status === 'confirmed') updateData.confirmedAt = new Date();
        if (body.status === 'completed') updateData.completedAt = new Date();

        const req = await prisma.recycleRequest.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                point: true,
                supervisor: true,
                assignedDriver: true,
            },
        });
        return NextResponse.json(req);
    } catch (error) {
        console.error('[Request PUT]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.recycleRequest.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Request DELETE]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
