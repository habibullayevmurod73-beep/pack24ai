import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_PATHS = ['/admin'];
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

// Token tekshiruvchi — admin_<timestamp>_<hash> formatini kutamiz
function isValidAdminToken(token: string): boolean {
    if (!token.startsWith('admin_')) return false;
    // "admin_TIMESTAMP" formatini qabul qiladi — ikki qism yetarli
    const parts = token.split('_');
    if (parts.length < 2) return false;
    return true;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
    const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) =>
        pathname.startsWith(path)
    );

    // ── Admin sahifalari himoyasi ─────────────────────────────────────────
    if (isAdminPath && !isPublicAdminPath) {
        const adminToken = request.cookies.get('admin_auth')?.value;

        if (!adminToken || !isValidAdminToken(adminToken)) {
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

    if (isAdminApi) {
        const adminToken = request.cookies.get('admin_auth')?.value;
        const authHeader = request.headers.get('x-admin-token');

        const cookieValid = adminToken && isValidAdminToken(adminToken);
        const headerValid = authHeader && isValidAdminToken(authHeader);

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
