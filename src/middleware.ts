import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_PATHS = ['/admin'];
const PUBLIC_ADMIN_PATHS = ['/admin/login'];
// Login API ni himoyadan istisno qilamiz — token hali yo'q bo'lganda ham ishlashi kerak
const PUBLIC_ADMIN_API_PATHS = ['/api/admin/login'];

/**
 * HMAC-SHA256 imzo tekshiruvi
 * Web Crypto API (SubtleCrypto) — Edge Runtime bilan mos keladi
 * Token format: admin_<timestamp>_<hmac>
 */
async function isValidAdminToken(token: string): Promise<boolean> {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return false;

    // Format: admin_<timestamp>_<hmac>
    const parts = token.split('_');
    if (parts.length < 3 || parts[0] !== 'admin') return false;

    const timestamp = parts[1];
    const receivedHmac = parts.slice(2).join('_');

    try {
        // Web Crypto API — Edge Runtime da ishlaydi
        const enc = new TextEncoder();
        const keyData = enc.encode(secret);
        const messageData = enc.encode(`admin_${timestamp}`);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Hex → Uint8Array
        const receivedBytes = new Uint8Array(
            receivedHmac.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
        );

        return await crypto.subtle.verify('HMAC', cryptoKey, receivedBytes, messageData);
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
    const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) =>
        pathname.startsWith(path)
    );

    // ── Admin sahifalari himoyasi ─────────────────────────────────────────
    if (isAdminPath && !isPublicAdminPath) {
        const adminToken = request.cookies.get('admin_auth')?.value;

        if (!adminToken || !(await isValidAdminToken(adminToken))) {
            const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // ── Admin API'lari himoyasi ───────────────────────────────────────────
    const isAdminApi =
        pathname.startsWith('/api/admin') ||
        pathname.startsWith('/api/warehouse') ||
        pathname.startsWith('/api/production') ||
        pathname.startsWith('/api/marketing');

    const isPublicAdminApi = PUBLIC_ADMIN_API_PATHS.some((path) =>
        pathname.startsWith(path)
    );

    if (isAdminApi && !isPublicAdminApi) {
        const adminToken = request.cookies.get('admin_auth')?.value;
        const authHeader = request.headers.get('x-admin-token');

        const cookieValid = adminToken && (await isValidAdminToken(adminToken));
        const headerValid = authHeader && (await isValidAdminToken(authHeader));

        if (!cookieValid && !headerValid) {
            return NextResponse.json(
                { error: "Ruxsat yo'q. Tizimga kirishingiz kerak." },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/warehouse/:path*',
        '/api/production/:path*',
        '/api/marketing/:path*',
    ],
};
