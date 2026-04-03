import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Admin API uchun autentifikatsiya tekshiruvi.
 * Cookie'dagi `admin_auth` tokenni HMAC-SHA256 bilan validatsiya qiladi.
 * Token formati: admin_<timestamp>_<hmac>
 * 
 * Foydalanish:
 * ```ts
 * import { verifyAdminAuth } from '@/lib/adminAuth';
 * 
 * export async function GET(req: NextRequest) {
 *     const authError = verifyAdminAuth(req);
 *     if (authError) return authError;
 *     // ... handler logic
 * }
 * ```
 */

const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 soat

export function verifyAdminAuth(req: NextRequest): NextResponse | null {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
        console.error('[adminAuth] ADMIN_SECRET env mavjud emas!');
        return NextResponse.json(
            { error: 'Server konfiguratsiya xatosi' },
            { status: 500 }
        );
    }

    const token = req.cookies.get('admin_auth')?.value;
    if (!token) {
        return NextResponse.json(
            { error: 'Avtorizatsiya talab etiladi' },
            { status: 401 }
        );
    }

    // Token formati: admin_<timestamp>_<hmac>
    const parts = token.split('_');
    if (parts.length < 3 || parts[0] !== 'admin') {
        return NextResponse.json(
            { error: 'Noto\'g\'ri token formati' },
            { status: 401 }
        );
    }

    const timestamp = parts[1];
    const receivedHmac = parts.slice(2).join('_');

    // Muddati tekshirish
    const tokenAge = Date.now() - parseInt(timestamp);
    if (isNaN(tokenAge) || tokenAge > TOKEN_MAX_AGE_MS) {
        return NextResponse.json(
            { error: 'Sessiya muddati tugagan. Qaytadan kiring.' },
            { status: 401 }
        );
    }

    // HMAC tekshirish
    const expectedHmac = crypto
        .createHmac('sha256', adminSecret)
        .update(`admin_${timestamp}`)
        .digest('hex');

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(receivedHmac, 'hex'),
            Buffer.from(expectedHmac, 'hex')
        );
        if (!isValid) {
            return NextResponse.json(
                { error: 'Noto\'g\'ri token' },
                { status: 401 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: 'Token validatsiya xatosi' },
            { status: 401 }
        );
    }

    // ✅ Muvaffaqiyatli — null qaytarilsa, handler davom etadi
    return null;
}
