/**
 * POST /api/auth/mobile/verify-otp
 * 
 * Mobil ilovalar uchun OTP tekshirish — JWT token qaytaradi.
 * Mavjud /api/auth/verify-otp ga o'xshash, lekin cookie o'rniga Bearer token.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const MAX_WRONG_ATTEMPTS = 5;
const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-mobile-secret';

function normalizePhone(phone: string): string {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) p = '+' + p;
    return p;
}

function generateToken(userId: number, phone: string): string {
    const payload = JSON.stringify({ userId, phone, ts: Date.now() });
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + hmac;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, otp } = body as { phone?: string; otp?: string };

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Telefon va kod kiritilishi shart' }, { status: 400 });
        }
        if (!/^\d{6}$/.test(otp.trim())) {
            return NextResponse.json({ error: 'Kod 6 raqamdan iborat bo\'lishi kerak' }, { status: 400 });
        }

        const cleanPhone = normalizePhone(phone);
        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        if (!user || !user.isActive) {
            return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
        }
        if (!user.otpCode || !user.otpExpiry) {
            return NextResponse.json({ error: 'Kod yuborilmagan' }, { status: 400 });
        }
        if (new Date() > user.otpExpiry) {
            await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiry: null, otpAttempts: 0 } });
            return NextResponse.json({ error: 'Kod muddati tugagan', expired: true }, { status: 401 });
        }
        if (user.otpAttempts >= MAX_WRONG_ATTEMPTS) {
            await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiry: null, otpAttempts: 0 } });
            return NextResponse.json({ error: 'Juda ko\'p urinish', tooManyAttempts: true }, { status: 401 });
        }
        if (user.otpCode !== otp.trim()) {
            await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
            return NextResponse.json({ error: 'Noto\'g\'ri kod' }, { status: 401 });
        }

        // ✅ OTP to'g'ri — token yarat
        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
        });

        const token = generateToken(user.id, cleanPhone);

        return NextResponse.json({
            ok: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                ecoPoints: user.ecoPoints || 0,
            },
        });
    } catch (error) {
        console.error('[Mobile Auth]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
