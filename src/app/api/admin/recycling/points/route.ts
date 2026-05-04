import { NextResponse } from 'next/server';
import { getPoints, createPoint } from '@/lib/domain/recycling/pointService';

export async function GET() {
    try {
        const points = await getPoints();
        return NextResponse.json(points);
    } catch (error) {
        console.error('[Points GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const point = await createPoint(body);
        return NextResponse.json(point, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('VALIDATION_ERROR:')) {
            return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
        }
        console.error('[Points POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

