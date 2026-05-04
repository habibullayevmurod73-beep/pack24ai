import { NextRequest, NextResponse } from 'next/server';
import { getFinanceReport } from '@/lib/domain/recycling/financeService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = parseInt(searchParams.get('period') ?? '30');

        const report = await getFinanceReport(period);
        return NextResponse.json(report);
    } catch (error) {
        console.error('[Finance GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

