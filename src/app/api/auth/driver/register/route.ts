/**
 * POST /api/auth/driver/register
 * 
 * Haydovchi ro'yxatdan o'tish — telefon/email + parol bilan.
 * 
 * Parol talablari:
 * 1. Kamida 1 ta bosh harf
 * 2. Kamida 1 ta kichik harf  
 * 3. Kamida 1 ta raqam
 * 4. Belgilar ketma-ket 2 martadan ko'p takrorlanmasligi kerak
 * 5. Kamida 6 ta belgi
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function normalizePhone(phone: string): string {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) p = '+' + p;
    return p;
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Kamida bitta bosh harf bo\'lishi kerak (A-Z)');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Kamida bitta kichik harf bo\'lishi kerak (a-z)');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Kamida bitta raqam bo\'lishi kerak (0-9)');
    }

    // Belgilar ketma-ket 2 martadan ko'p takrorlanmasligi
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Belgilar ketma-ket 2 martadan ko\'p takrorlanmasligi kerak');
    }

    return { valid: errors.length === 0, errors };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, password, vehicleInfo } = body as {
            name?: string;
            phone?: string;
            email?: string;
            password?: string;
            vehicleInfo?: string;
        };

        // === Validatsiya ===
        if (!name?.trim() || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak' },
                { status: 400 }
            );
        }

        // Telefon yoki email majburiy
        if (!phone?.trim() && !email?.trim()) {
            return NextResponse.json(
                { error: 'Telefon raqam yoki email kiritilishi shart' },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Parol kiritilishi shart' },
                { status: 400 }
            );
        }

        // Parol validatsiyasi
        const passCheck = validatePassword(password);
        if (!passCheck.valid) {
            return NextResponse.json(
                { error: passCheck.errors.join('. ') },
                { status: 400 }
            );
        }

        // Telefon normalizatsiya
        const cleanPhone = phone ? normalizePhone(phone) : null;

        if (cleanPhone && cleanPhone.length < 13) {
            return NextResponse.json(
                { error: 'Telefon raqam formati: +998XXXXXXXXX' },
                { status: 400 }
            );
        }

        // Email validatsiya
        const cleanEmail = email?.trim().toLowerCase() || null;
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return NextResponse.json(
                { error: 'Email formati noto\'g\'ri' },
                { status: 400 }
            );
        }

        // Telefon yoki email allaqachon mavjudmi?
        if (cleanPhone) {
            const existingByPhone = await prisma.driver.findUnique({
                where: { phone: cleanPhone },
            });
            if (existingByPhone) {
                return NextResponse.json(
                    { error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan. Iltimos, tizimga kiring.' },
                    { status: 409 }
                );
            }
        }

        if (cleanEmail) {
            const existingByEmail = await prisma.driver.findUnique({
                where: { email: cleanEmail },
            });
            if (existingByEmail) {
                return NextResponse.json(
                    { error: 'Bu email allaqachon ro\'yxatdan o\'tgan. Iltimos, tizimga kiring.' },
                    { status: 409 }
                );
            }
        }

        // Parolni hash qilish
        const passwordHash = await bcrypt.hash(password, 12);

        // Driver yaratish
        const driver = await prisma.driver.create({
            data: {
                name: name.trim(),
                phone: cleanPhone || `temp_${Date.now()}`, // Telefon majburiy bo'lgani uchun
                email: cleanEmail,
                passwordHash,
                vehicleInfo: vehicleInfo?.trim() || null,
                status: 'active',
                registeredAt: new Date(),
            },
            include: {
                point: { select: { id: true, regionUz: true } },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Endi tizimga kiring.',
            driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                email: driver.email,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('[Driver Register Error]:', error);
        return NextResponse.json(
            { error: 'Serverda xatolik yuz berdi' },
            { status: 500 }
        );
    }
}
