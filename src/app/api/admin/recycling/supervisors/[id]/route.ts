import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/recycling/supervisors/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const supervisor = await prisma.supervisor.update({
            where: { id: Number(id) },
            data: {
                ...(body.name && { name: body.name.trim() }),
                ...(body.phone && { phone: body.phone.trim() }),
                ...(body.telegramId !== undefined && { telegramId: body.telegramId || null }),
                ...(body.telegramName !== undefined && { telegramName: body.telegramName || null }),
                ...(body.pointId !== undefined && { pointId: body.pointId ? Number(body.pointId) : null }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            },
            include: { point: true },
        });

        return NextResponse.json(supervisor);
    } catch (error) {
        console.error('[Supervisor PUT]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// DELETE /api/admin/recycling/supervisors/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.supervisor.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Supervisor DELETE]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
