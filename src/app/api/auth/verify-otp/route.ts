/**
 * POST /api/auth/verify-otp
 *
 * Telegram orqali yuborilgan OTP kodni tekshiradi.
 * Muvaffaqiyatli bo'lsa, NextAuth session uchun foydalanish mumkin.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_WRONG_ATTEMPTS = 5;

function normalizePhone(phone: string): string {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) p = '+' + p;
    return p;
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

        const user = await prisma.user.findUnique({
            where: { phone: cleanPhone },
        });

        if (!user || !user.isActive) {
            return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
        }

        // OTP mavjudligini tekshirish
        if (!user.otpCode || !user.otpExpiry) {
            return NextResponse.json({
                error: 'Tasdiqlash kodi yuborilmagan. Avval kod so\'rang.',
            }, { status: 400 });
        }

        // Vaqt tugaganmi?
        if (new Date() > user.otpExpiry) {
            await prisma.user.update({
                where: { id: user.id },
                data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
            });
            return NextResponse.json({
                error: 'Kod muddati tugagan. Qayta kod so\'rang.',
                expired: true,
            }, { status: 401 });
        }

        // Urinishlar soni chegarasi
        if (user.otpAttempts >= MAX_WRONG_ATTEMPTS) {
            await prisma.user.update({
                where: { id: user.id },
                data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
            });
            return NextResponse.json({
                error: 'Juda ko\'p noto\'g\'ri urinish. Yangi kod so\'rang.',
                tooManyAttempts: true,
            }, { status: 401 });
        }

        // Kodni solishtirish
        if (user.otpCode !== otp.trim()) {
            await prisma.user.update({
                where: { id: user.id },
                data: { otpAttempts: { increment: 1 } },
            });
            const remaining = MAX_WRONG_ATTEMPTS - user.otpAttempts - 1;
            return NextResponse.json({
                error: `Noto'g'ri kod. Qolgan urinish: ${remaining}`,
            }, { status: 401 });
        }

        // ✅ Muvaffaqiyatli — OTP ni o'chirish
        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
        });

        const { passwordHash: _, otpCode: __, telegramCode: ___, ...safeUser } = user;
        return NextResponse.json({
            ok: true,
            message: 'Tasdiqlandi!',
            user: safeUser,
        });

    } catch (error) {
        console.error('[VerifyOTP Error]:', error);
        return NextResponse.json({ error: 'Serverda xatolik' }, { status: 500 });
    }
}
