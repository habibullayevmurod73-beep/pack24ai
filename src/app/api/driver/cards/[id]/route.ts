/**
 * DELETE /api/driver/cards/[id]
 * PUT /api/driver/cards/[id] — default qilish
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = parseToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const cardId = Number(id);

    // Avval barcha kartalardan default'ni olib tashlash
    await prisma.driverCard.updateMany({
        where: { driverId: auth.driverId },
        data: { isDefault: false },
    });

    // Tanlangan kartani default qilish
    const card = await prisma.driverCard.update({
        where: { id: cardId, driverId: auth.driverId },
        data: { isDefault: true },
    });

    return NextResponse.json(card);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = parseToken(req.headers.get('authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.driverCard.update({
        where: { id: Number(id), driverId: auth.driverId },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true });
}
