import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Oddiy hash (bcrypt o'rniga — bcrypt server-side ma'qul, lekin serverless da bazan muammo)
// Production da: npm install bcryptjs va shu bilan almashtiring
function hashPassword(password: string): string {
    // MUHIM: qavs operator precedence uchun zarur
    return crypto
        .createHash('sha256')
        .update(password + (process.env.AUTH_SECRET ?? ''))
        .digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// POST /api/auth/login
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, password } = body;

        // Validatsiya
        if (!phone || !password) {
            return NextResponse.json(
                { error: "Telefon va parol kiritilishi shart" },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/\s/g, '');
        const phoneRegex = /^\+998[0-9]{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
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
        if (!verifyPassword(password, user.passwordHash)) {
            return NextResponse.json(
                { error: "Parol noto'g'ri" },
                { status: 401 }
            );
        }

        // Muvaffaqiyatli login
        const { passwordHash: _, ...safeUser } = user;
        return NextResponse.json({
            success: true,
            user: safeUser,
        });

    } catch (error) {
        console.error('[Auth Login Error]:', error);
        return NextResponse.json(
            { error: "Serverda xatolik yuz berdi" },
            { status: 500 }
        );
    }
}
