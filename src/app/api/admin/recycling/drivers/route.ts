import { NextRequest, NextResponse } from 'next/server';
import { getDrivers, createDriver } from '@/lib/domain/recycling/driverService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const supervisorId = searchParams.get('supervisorId');
        const pointId = searchParams.get('pointId');
        const status = searchParams.get('status');

        const result = await getDrivers({ supervisorId, pointId, status });
        return NextResponse.json(result);
    } catch (error) {
        console.error('[Drivers GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const driver = await createDriver(body);
        return NextResponse.json(driver, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.startsWith('VALIDATION_ERROR:')) {
                return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
            }
        }
        if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
            return NextResponse.json({ error: 'Bu telefon raqam allaqachon ro\'yxatda' }, { status: 409 });
        }
        console.error('[Drivers POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

