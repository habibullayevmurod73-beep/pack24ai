import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    hashPassword,
    isValidPhone,
    normalizePhone,
} from '@/lib/userAuth';
import {
    generateReferralCode,
    REFERRAL_SIGNUP_BONUS,
} from '@/lib/referral';

async function createUniqueReferralCode(
    tx: Pick<typeof prisma, 'user'>
): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const referralCode = generateReferralCode();
        const existing = await tx.user.findUnique({
            where: { referralCode },
            select: { id: true },
        });

        if (!existing) {
            return referralCode;
        }
    }

    throw new Error('Referral code yaratib bo\'lmadi');
}

// POST /api/auth/register
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, password, referralCode } = body as {
            name?: string;
            phone?: string;
            password?: string;
            referralCode?: string;
        };

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

        const cleanPhone = normalizePhone(phone);
        if (!isValidPhone(cleanPhone)) {
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

        const normalizedReferralCode = referralCode?.trim().toUpperCase() || null;
        const referrer = normalizedReferralCode
            ? await prisma.user.findUnique({
                where: { referralCode: normalizedReferralCode },
                select: { id: true },
            })
            : null;

        if (normalizedReferralCode && !referrer) {
            return NextResponse.json(
                { error: "Referal kodi topilmadi yoki eskirgan" },
                { status: 400 }
            );
        }

        const newUser = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: name.trim(),
                    phone: cleanPhone,
                    passwordHash: await hashPassword(password),
                    role: 'user',
                    isActive: true,
                    referralCode: await createUniqueReferralCode(tx),
                    referredById: referrer?.id ?? null,
                },
            });

            if (referrer?.id) {
                await tx.user.update({
                    where: { id: referrer.id },
                    data: {
                        ecoPoints: {
                            increment: REFERRAL_SIGNUP_BONUS,
                        },
                    },
                });
            }

            return createdUser;
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
