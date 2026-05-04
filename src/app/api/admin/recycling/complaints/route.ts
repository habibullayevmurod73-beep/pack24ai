import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, createComplaint, updateComplaint } from '@/lib/domain/recycling/complaintService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const level = searchParams.get('level');

        const complaints = await getComplaints({ status, level });
        return NextResponse.json(complaints);
    } catch (error) {
        console.error('[Complaints GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const complaint = await createComplaint(body);
        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('VALIDATION_ERROR:')) {
            return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
        }
        console.error('[Complaints POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const complaint = await updateComplaint(body);
        return NextResponse.json(complaint);
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('VALIDATION_ERROR:')) {
            return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
        }
        console.error('[Complaints PUT]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

