/**
 * GET/PUT /api/driver/profile
 * 
 * Haydovchi o'z profilini ko'rish va yangilash.
 * Token orqali autentifikatsiya.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-driver-secret';

function parseDriverToken(authHeader: string | null): { driverId: number } | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const expectedHmac = crypto.createHmac('sha256', TOKEN_SECRET)
            .update(JSON.stringify({ driverId: payload.driverId, identifier: payload.identifier, role: payload.role, ts: payload.ts }))
            .digest('hex');
        if (parts[1] !== expectedHmac) return null;
        return { driverId: payload.driverId };
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const auth = parseDriverToken(req.headers.get('authorization'));
    if (!auth) {
        return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
        where: { id: auth.driverId },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
            isOnline: true,
            vehicleInfo: true,
            registrationCode: true,
            registeredAt: true,
            lastSeenAt: true,
            lastLat: true,
            lastLng: true,
            createdAt: true,
            supervisor: { select: { id: true, name: true, phone: true } },
            point: { select: { id: true, regionUz: true, cityUz: true } },
            _count: { select: { collections: true, assignedRequests: true } },
        },
    });

    if (!driver) {
        return NextResponse.json({ error: 'Haydovchi topilmadi' }, { status: 404 });
    }

    return NextResponse.json(driver);
}

export async function PUT(req: NextRequest) {
    const auth = parseDriverToken(req.headers.get('authorization'));
    if (!auth) {
        return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const updateData: any = {};

        // Haydovchi faqat ba'zi maydonlarni yangilay oladi
        if (body.name?.trim()) updateData.name = body.name.trim();
        if (body.vehicleInfo !== undefined) updateData.vehicleInfo = body.vehicleInfo?.trim() || null;
        if (body.isOnline !== undefined) updateData.isOnline = !!body.isOnline;
        if (body.lastLat !== undefined) updateData.lastLat = body.lastLat;
        if (body.lastLng !== undefined) updateData.lastLng = body.lastLng;
        if (body.isOnline !== undefined || body.lastLat !== undefined) {
            updateData.lastSeenAt = new Date();
        }

        const driver = await prisma.driver.update({
            where: { id: auth.driverId },
            data: updateData,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                status: true,
                isOnline: true,
                vehicleInfo: true,
                lastSeenAt: true,
                supervisor: { select: { id: true, name: true, phone: true } },
                point: { select: { id: true, regionUz: true, cityUz: true } },
            },
        });

        return NextResponse.json(driver);
    } catch (error) {
        console.error('[Driver Profile PUT]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
