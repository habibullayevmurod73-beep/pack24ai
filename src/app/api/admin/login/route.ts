import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * HMAC-SHA256 imzoli token yaratish
 * Format: admin_<timestamp>_<hmac>
 */
function createAdminToken(secret: string): string {
    const timestamp = Date.now().toString();
    const hmac = crypto
        .createHmac('sha256', secret)
        .update(`admin_${timestamp}`)
        .digest('hex');
    return `admin_${timestamp}_${hmac}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body as { username?: string; password?: string };

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminSecret = process.env.ADMIN_SECRET;

        // Env vars sozlanganligini tekshirish
        if (!adminUsername || !adminPassword || !adminSecret) {
            console.error('[admin/login] ADMIN_USERNAME, ADMIN_PASSWORD yoki ADMIN_SECRET env da yo\'q!');
            return NextResponse.json(
                { error: 'Server konfiguratsiya xatosi' },
                { status: 500 }
            );
        }

        // Timing-safe taqqoslash (timing attack oldini olish uchun)
        const usernameMatch = username
            ? crypto.timingSafeEqual(
                Buffer.from(username),
                Buffer.from(adminUsername)
              )
            : false;

        const passwordMatch = password
            ? crypto.timingSafeEqual(
                Buffer.from(password),
                Buffer.from(adminPassword)
              )
            : false;

        if (!usernameMatch || !passwordMatch) {
            // Brute-force oldini olish uchun 300ms kechikish
            await new Promise(r => setTimeout(r, 300));
            return NextResponse.json(
                { error: "Login yoki parol noto'g'ri" },
                { status: 401 }
            );
        }

        const token = createAdminToken(adminSecret);

        const res = NextResponse.json({ ok: true });

        // HttpOnly cookie — JS o'qiy olmaydi (XSS ga chidamli)
        res.cookies.set('admin_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60, // 8 soat
            path: '/',
        });

        return res;
    } catch {
        return NextResponse.json(
            { error: 'So\'rov xato formatda' },
            { status: 400 }
        );
    }
}
