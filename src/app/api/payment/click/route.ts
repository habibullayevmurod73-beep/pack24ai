import { NextRequest, NextResponse } from 'next/server';

// ─── Click Uzbekistan to'lov integratsiyasi ─────────────────────────────────
// Hujjatlar: https://docs.click.uz/

const CLICK_SERVICE_ID  = process.env.CLICK_SERVICE_ID  ?? '';
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID ?? '';
const CLICK_SECRET_KEY  = process.env.CLICK_SECRET_KEY  ?? '';
const CLICK_MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID ?? '';

// ─── POST /api/payment/click/prepare — to'lov yaratish ──────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, amount, returnUrl } = body;

        if (!orderId || !amount) {
            return NextResponse.json({ error: 'orderId va amount majburiy' }, { status: 400 });
        }

        // Click to'lov URL yaratish
        const params = new URLSearchParams({
            service_id:  CLICK_SERVICE_ID,
            merchant_id: CLICK_MERCHANT_ID,
            amount:      amount.toString(),
            transaction_param: orderId.toString(),
            return_url:  returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        });

        const clickPayUrl = `https://my.click.uz/services/pay?${params.toString()}`;

        return NextResponse.json({
            payUrl: clickPayUrl,
            orderId,
            amount,
        });
    } catch (error) {
        console.error('[API/payment/click]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/payment/click — Click webhook callback (PREPARE/COMPLETE) ─────
// Click PREPARE & COMPLETE webhook handler
export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'Click payment webhook endpoint' });
}
