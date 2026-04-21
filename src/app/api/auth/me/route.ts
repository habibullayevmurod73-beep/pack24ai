import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCurrentUserId(): Promise<number | null> {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    return Number.isFinite(userId) ? userId : null;
}

// PATCH /api/auth/me — Foydalanuvchi profilini yangilash
export async function PATCH(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body as { name?: string };

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Foydalanuvchi topilmadi' },
                { status: 404 }
            );
        }

        // Yangilash
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
        });

        const { passwordHash: _ph, otpCode: _oc, ...safeUser } = updated;
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
        void request;

        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
        }

        const { passwordHash: _ph, otpCode: _oc, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('[GET /api/auth/me]', error);
        return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
    }
}
