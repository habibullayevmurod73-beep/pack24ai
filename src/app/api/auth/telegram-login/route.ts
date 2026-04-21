/**
 * POST /api/auth/telegram-login
 * Telegram kodi orqali kirish — telefon + 5 raqamli kod
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, code } = body as { phone?: string; code?: string };

        if (!phone || !code) {
            return NextResponse.json(
                { error: 'Telefon va kod kiritilishi shart' },
                { status: 400 }
            );
        }

        // Telefon normalizatsiya
        let cleanPhone = phone.replace(/[^\d+]/g, '');
        if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

        if (!/^\d{5}$/.test(code.trim())) {
            return NextResponse.json(
                { error: 'Kod 5 raqamdan iborat bo\'lishi kerak' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        if (!user) {
            return NextResponse.json(
                { error: 'Bunday telefon raqam ro\'yxatdan o\'tmagan. Telegram botga /start yuboring.' },
                { status: 404 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json({ error: 'Hisobingiz bloklangan' }, { status: 403 });
        }

        if (!user.telegramCode) {
            return NextResponse.json(
                { error: 'Sizning hisobingizda Telegram kodi yo\'q. Botga /start yuboring.' },
                { status: 400 }
            );
        }

        if (user.telegramCode !== code.trim()) {
            return NextResponse.json({ error: 'Noto\'g\'ri kod' }, { status: 401 });
        }

        const { passwordHash: _, telegramCode: __, ...safeUser } = user;
        return NextResponse.json({
            success: true,
            user: safeUser,
            message: 'Muvaffaqiyatli kirdingiz',
        });

    } catch (error) {
        console.error('[TelegramLogin Error]:', error);
        return NextResponse.json(
            { error: 'Serverda xatolik yuz berdi' },
            { status: 500 }
        );
    }
}
