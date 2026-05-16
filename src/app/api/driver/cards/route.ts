/**
 * GET/POST /api/driver/cards
 * Haydovchi plastik kartalarini boshqarish
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-driver-secret';

function parseToken(authHeader: string | null): { driverId: number } | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const parts = authHeader.slice(7).split('.');
    if (parts.length !== 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const hmac = crypto.createHmac('sha256', TOKEN_SECRET)
            .update(JSON.stringify({ driverId: payload.driverId, identifier: payload.identifier, role: payload.role, ts: payload.ts }))
            .digest('hex');
        return parts[1] === hmac ? { driverId: payload.driverId } : null;
    } catch { return null; }
}

function maskCard(num: string): string {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 12) return '**** **** **** ****';
    return `**** **** **** ${clean.slice(-4)}`;
}

function detectCardType(num: string): string {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('8600')) return 'uzcard';
    if (clean.startsWith('9860')) return 'humo';
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    return 'other';
}

// GET — barcha kartalarni olish
export async function GET(req: NextRequest) {
    const auth = parseToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cards = await prisma.driverCard.findMany({
        where: { driverId: auth.driverId, isActive: true },
        orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json(cards);
}

// POST — yangi karta qo'shish
export async function POST(req: NextRequest) {
    const auth = parseToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { cardNumber, cardHolder, expiryMonth, expiryYear } = await req.json();

        if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear) {
            return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 });
        }

        const clean = cardNumber.replace(/\D/g, '');
        if (clean.length < 15 || clean.length > 19) {
            return NextResponse.json({ error: 'Karta raqami noto\'g\'ri' }, { status: 400 });
        }

        // Birinchi karta avtomatik default bo'ladi
        const existingCount = await prisma.driverCard.count({
            where: { driverId: auth.driverId, isActive: true },
        });

        const card = await prisma.driverCard.create({
            data: {
                driverId: auth.driverId,
                cardNumber: maskCard(cardNumber),
                cardHolder: cardHolder.trim().toUpperCase(),
                expiryMonth: Number(expiryMonth),
                expiryYear: Number(expiryYear),
                cardType: detectCardType(cardNumber),
                isDefault: existingCount === 0,
            },
        });

        return NextResponse.json(card, { status: 201 });
    } catch (error) {
        console.error('[Cards POST]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
