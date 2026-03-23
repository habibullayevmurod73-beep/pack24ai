import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string): string {
    // MUHIM: qavs operator precedence uchun zarur
    return crypto
        .createHash('sha256')
        .update(password + (process.env.AUTH_SECRET ?? ''))
        .digest('hex');
}

// POST /api/auth/register
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, password } = body;

        // Validatsiya
        if (!name || !phone || !password) {
            return NextResponse.json(
                { error: "Ism, telefon va parol kiritilishi shart" },
                { status: 400 }
            );
        }

        if (name.trim().length < 2) {
            return NextResponse.json(
                { error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" },
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

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
                { status: 400 }
            );
        }


        // Bunday telefon allaqachon bormi?
        const existing = await prisma.user.findUnique({
            where: { phone: cleanPhone },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
                { status: 409 }
            );
        }

        // Yangi foydalanuvchi yaratish
        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                phone: cleanPhone,
                passwordHash: hashPassword(password),
                role: 'user',
                isActive: true,
            },
        });

        const { passwordHash: _, ...safeUser } = newUser;
        return NextResponse.json({
            success: true,
            user: safeUser,
        }, { status: 201 });

    } catch (error) {
        console.error('[Auth Register Error]:', error);
        return NextResponse.json(
            { error: "Serverda xatolik yuz berdi" },
            { status: 500 }
        );
    }
}
