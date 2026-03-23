import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// PATCH /api/auth/me — Foydalanuvchi profilini yangilash
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, name } = body;

        if (!phone) {
            return NextResponse.json(
                { error: 'Telefon raqam majburiy (identifikator sifatida)' },
                { status: 400 }
            );
        }

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/\s/g, '');

        // Foydalanuvchini topish
        const user = await prisma.user.findUnique({
            where: { phone: cleanPhone },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Foydalanuvchi topilmadi' },
                { status: 404 }
            );
        }

        // Yangilash
        const updated = await prisma.user.update({
            where: { phone: cleanPhone },
            data: { name: name.trim() },
        });

        const { passwordHash: _, ...safeUser } = updated;
        return NextResponse.json({ success: true, user: safeUser });

    } catch (error) {
        console.error('[PATCH /api/auth/me]', error);
        return NextResponse.json(
            { error: 'Serverda xatolik yuz berdi' },
            { status: 500 }
        );
    }
}

// GET /api/auth/me — Joriy foydalanuvchi ma'lumotlari
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ error: 'phone majburiy' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { phone: phone.replace(/\s/g, '') },
        });

        if (!user) {
            return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
        }

        const { passwordHash: _, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('[GET /api/auth/me]', error);
        return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
    }
}
