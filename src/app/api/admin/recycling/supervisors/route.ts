import { NextRequest, NextResponse } from 'next/server';
import { getSupervisors, createSupervisor } from '@/lib/domain/recycling/supervisorService';

export async function GET() {
    try {
        const supervisors = await getSupervisors();
        return NextResponse.json(supervisors);
    } catch (error) {
        console.error('[Supervisors GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const supervisor = await createSupervisor(body);
        return NextResponse.json(supervisor, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.startsWith('VALIDATION_ERROR:')) {
                return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
            }
        }
        if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
            return NextResponse.json({ error: 'Bu telefon raqam allaqachon ro\'yxatda' }, { status: 409 });
        }
        console.error('[Supervisors POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

