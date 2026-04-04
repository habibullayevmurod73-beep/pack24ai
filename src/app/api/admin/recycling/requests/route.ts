import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const requests = await prisma.recycleRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                point: true,
                supervisor: true,
                assignedDriver: true,
                collections: true,
                complaints: true,
            },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error('[Requests GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
