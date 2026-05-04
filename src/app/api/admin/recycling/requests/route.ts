import { NextResponse } from 'next/server';
import { getRecycleRequests } from '@/lib/domain/recycling/requestService';

export async function GET() {
    try {
        const requests = await getRecycleRequests();
        return NextResponse.json(requests);
    } catch (error) {
        console.error('[Requests GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
