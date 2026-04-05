import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const points = await prisma.recyclePoint.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(points);
    } catch (error) {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.regionUz || !body.cityUz || !body.phone) {
            return NextResponse.json({ error: 'Asosiy maydonlar to\'ldirilmagan' }, { status: 400 });
        }

        const point = await prisma.recyclePoint.create({
            data: {
                regionUz: body.regionUz,
                regionRu: body.regionRu || body.regionUz,
                cityUz: body.cityUz,
                cityRu: body.cityRu || body.cityUz,
                phone: body.phone,
                address: body.address || null,
                lat: body.lat ? Number(body.lat) : null,
                lng: body.lng ? Number(body.lng) : null,
                status: body.status || 'planned',
                color: body.color || 'bg-blue-500',
            }
        });
        return NextResponse.json(point, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
