/**
 * POST /api/auth/driver/login
 * 
 * Haydovchi login — telefon + registration code bilan kirish.
 * Bearer token qaytaradi.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_SECRET || 'pack24-driver-secret';

function normalizePhone(phone: string): string {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) p = '+' + p;
    return p;
}

function generateDriverToken(driverId: number, phone: string): string {
    const payload = JSON.stringify({ driverId, phone, role: 'driver', ts: Date.now() });
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + hmac;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, code } = body as { phone?: string; code?: string };

        if (!phone || !code) {
            return NextResponse.json({ error: 'Telefon va kod kiritilishi shart' }, { status: 400 });
        }

        const cleanPhone = normalizePhone(phone);

        const driver = await prisma.driver.findUnique({
            where: { phone: cleanPhone },
            include: {
                point: { select: { id: true, regionUz: true } },
                supervisor: { select: { id: true, name: true, phone: true } },
            },
        });

        if (!driver) {
            return NextResponse.json({ error: 'Haydovchi topilmadi' }, { status: 404 });
        }

        if (driver.status === 'inactive') {
            return NextResponse.json({ error: 'Hisobingiz faol emas' }, { status: 403 });
        }

        // Registration code tekshirish
        if (driver.registrationCode !== code.trim()) {
            return NextResponse.json({ error: 'Noto\'g\'ri kod' }, { status: 401 });
        }

        const token = generateDriverToken(driver.id, cleanPhone);

        return NextResponse.json({
            ok: true,
            token,
            driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                status: driver.status,
                isOnline: driver.isOnline,
                vehicleInfo: driver.vehicleInfo,
                point: driver.point,
                supervisor: driver.supervisor,
            },
        });
    } catch (error) {
        console.error('[Driver Auth]:', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
