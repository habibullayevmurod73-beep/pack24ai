import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin sahifalari uchun himoya
// Hozircha localStorage-based token tekshiruvi (client-side)
// Kelajakda: NextAuth JWT cookie bilan almashtiriladi

const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_PATHS = ['/admin'];

// Public admin paths — login sahifasi himoyalanmaydi
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route'mi tekshirish
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Admin route uchun cookie tekshirish
  if (isAdminPath && !isPublicAdminPath) {
    // Cookie'dan admin_auth tokenini tekshirish
    const adminToken = request.cookies.get('admin_auth')?.value;

    if (!adminToken) {
      // Token yo'q — login sahifasiga yo'naltirish
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      // Qaytish uchun URL saqlash
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token bor — token formatini tekshirish (oddiy validatsiya)
    try {
      // Token "admin_" bilan boshlanishi kerak
      if (!adminToken.startsWith('admin_')) {
        const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API routes himoyasi
  const isAdminApi = pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/warehouse') ||
    pathname.startsWith('/api/production') ||
    pathname.startsWith('/api/marketing');

  if (isAdminApi) {
    const adminToken = request.cookies.get('admin_auth')?.value;
    // API header'dan ham tekshirish
    const authHeader = request.headers.get('x-admin-token');

    if (!adminToken && !authHeader) {
      return NextResponse.json(
        { error: 'Ruxsat yo\'q. Tizimga kirishingiz kerak.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin sahifalari
    '/admin/:path*',
    // Admin API'lari
    '/api/admin/:path*',
    '/api/warehouse/:path*',
    '/api/production/:path*',
    '/api/marketing/:path*',
  ],
};
