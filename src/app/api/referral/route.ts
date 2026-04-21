import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    generateReferralCode,
    REFERRAL_SIGNUP_BONUS,
} from '@/lib/referral';

async function createUniqueReferralCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const referralCode = generateReferralCode();
        const existing = await prisma.user.findUnique({
            where: { referralCode },
            select: { id: true },
        });
        if (!existing) {
            return referralCode;
        }
    }

    throw new Error('Referal kodini yaratib bo\'lmadi');
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = Number(session?.user?.id);
        if (!Number.isFinite(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                referrals: {
                    select: { id: true, name: true, createdAt: true, ecoPoints: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Agar foydalanuvchida hali referal kod bo'lmasa, uni yaratib beramiz
        if (!user.referralCode) {
            user = await prisma.user.update({
                where: { id: userId },
                data: {
                    referralCode: await createUniqueReferralCode()
                },
                include: {
                    referrals: {
                        select: { id: true, name: true, createdAt: true, ecoPoints: true }
                    }
                }
            });
        }

        const referralBonusPoints = user.referrals.length * REFERRAL_SIGNUP_BONUS;

        return NextResponse.json({
            success: true,
            referralCode: user.referralCode,
            points: user.ecoPoints,
            referralBonusPoints,
            referrals: user.referrals,
        });

    } catch (error) {
        console.error('[referral] GET xatosi:', error);
        return NextResponse.json(
            { error: "Server xatosi" },
            { status: 500 }
        );
    }
}
