import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    isValidPhone,
    normalizePhone,
    verifyPassword,
} from '@/lib/userAuth';

// POST /api/auth/login
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, password } = body as { phone?: string; password?: string };

        // Validatsiya
        if (!phone || !password) {
            return NextResponse.json(
                { error: "Telefon va parol kiritilishi shart" },
                { status: 400 }
            );
        }

        const cleanPhone = normalizePhone(phone);
        if (!isValidPhone(cleanPhone)) {
            return NextResponse.json(
                { error: "Telefon formati: +998901234567" },
                { status: 400 }
            );
        }

        // Foydalanuvchini topish
        const user = await prisma.user.findUnique({
            where: { phone: cleanPhone },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Bunday foydalanuvchi topilmadi" },
                { status: 404 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: "Hisobingiz bloklangan" },
                { status: 403 }
            );
        }

        // Parolni tekshirish
        const passwordCheck = await verifyPassword(password, user.passwordHash);
        if (!passwordCheck.valid) {
            return NextResponse.json(
                { error: "Parol noto'g'ri" },
                { status: 401 }
            );
        }

        if (passwordCheck.needsRehash && passwordCheck.nextHash) {
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: passwordCheck.nextHash },
            });
        }

        // Legacy API: browser auth endi NextAuth credentials orqali ishlashi kerak.
        const { passwordHash: _, ...safeUser } = user;
        return NextResponse.json({
            success: true,
            user: safeUser,
            deprecated: true,
        });

    } catch (error) {
        console.error('[Auth Login Error]:', error);
        return NextResponse.json(
            { error: "Serverda xatolik yuz berdi" },
            { status: 500 }
        );
    }
}
