import { NextRequest, NextResponse } from 'next/server';
import { createRecycleCollection, getRecycleCollections } from '@/lib/domain/recycling/collectionService';

// GET /api/admin/recycling/collections — Yig'ishlar ro'yxati
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const driverId = searchParams.get('driverId');
        const requestId = searchParams.get('requestId');
        const paymentStatus = searchParams.get('paymentStatus');
        const period = parseInt(searchParams.get('period') ?? '90');

        const collections = await getRecycleCollections({ driverId, requestId, paymentStatus, period });
        return NextResponse.json(collections);
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_PAYMENT_STATUS') {
            return NextResponse.json({ error: 'paymentStatus noto\'g\'ri' }, { status: 400 });
        }
        console.error('[Collections GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// POST /api/admin/recycling/collections — Yangi yig'ish hisob yaratish (kalkulator)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const collection = await createRecycleCollection(body);
        return NextResponse.json(collection, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.startsWith('VALIDATION_ERROR:')) {
                return NextResponse.json({ error: error.message.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
            }
            if (error.message === 'COLLECTION_ALREADY_EXISTS') {
                return NextResponse.json({ error: 'Bu ariza uchun yig\'ish hisobi allaqachon yaratilgan' }, { status: 409 });
            }
            if (error.message === 'REQUEST_NOT_FOUND') {
                return NextResponse.json({ error: 'Ariza topilmadi' }, { status: 404 });
            }
            if (error.message === 'INVALID_REQUEST_STATUS') {
                return NextResponse.json({ error: 'Ariza holati yig\'ish yaratish uchun mos emas' }, { status: 409 });
            }
        }
        console.error('[Collections POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
