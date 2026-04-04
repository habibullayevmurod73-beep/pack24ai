import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram/bot';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone || !body.regionId) {
            return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 });
        }

        const point = await prisma.recyclePoint.findUnique({ where: { id: Number(body.regionId) } });

        const req = await prisma.recycleRequest.create({
            data: {
                name: body.name,
                phone: body.phone,
                regionId: Number(body.regionId),
                material: body.material || null,
                volume: body.volume ? Number(body.volume) : null,
                pickupType: body.pickupType || 'base',
                address: body.address || null,
                customerTgId: body.customerTgId || null,
                status: 'new',
            },
        });

        // Telegramga bildirishnoma — adminga
        try {
            const message =
                `♻️ <b>Yangi Makulatura So'rovi #${req.id}</b>\n\n` +
                `👤 Mijoz: ${req.name}\n` +
                `📞 Telefon: ${req.phone}\n` +
                `📍 Viloyat: ${point ? point.regionUz : body.regionId}\n` +
                `${req.address ? `🏠 Manzil: ${req.address}\n` : ''}` +
                `🚚 Usul: ${req.pickupType === 'pickup' ? 'Kuryer chiqishi' : 'O\'zi olib keladi'}\n` +
                `📦 Hajmi: ${req.volume ? req.volume + ' kg' : 'Noma\'lum'}\n` +
                `📄 Material: ${req.material || 'Ko\'rsatilmagan'}`;

            await sendTelegramMessage(message);
        } catch (botErr) {
            console.error('Telegramga yuborib bolmadi', botErr);
        }

        return NextResponse.json({ success: true, req }, { status: 201 });
    } catch (error) {
        console.error('[Recycling POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
