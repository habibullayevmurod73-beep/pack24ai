import { NextRequest, NextResponse } from 'next/server';
import {
    ADMIN_AUTH_COOKIE,
    ADMIN_AUTH_HEADER,
    validateAdminToken,
} from '@/lib/adminAuthShared';

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

export async function verifyAdminAuth(req: NextRequest): Promise<NextResponse | null> {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
        console.error('[adminAuth] ADMIN_SECRET env mavjud emas!');
        return NextResponse.json(
            { error: 'Server konfiguratsiya xatosi' },
            { status: 500 }
        );
    }

    const token =
        req.cookies.get(ADMIN_AUTH_COOKIE)?.value ??
        req.headers.get(ADMIN_AUTH_HEADER);

    if (!token) {
        return NextResponse.json(
            { error: 'Avtorizatsiya talab etiladi' },
            { status: 401 }
        );
    }

    const validation = await validateAdminToken(token, adminSecret);
    if (!validation.valid) {
        if (validation.reason === 'expired') {
            return NextResponse.json(
                { error: 'Sessiya muddati tugagan. Qaytadan kiring.' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Noto'g'ri yoki buzilgan admin token" },
            { status: 401 }
        );
    }

    // ✅ Muvaffaqiyatli — null qaytarilsa, handler davom etadi
    return null;
}
