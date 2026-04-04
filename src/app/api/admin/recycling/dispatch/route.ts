import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram/bot';

// ─── Yordamchi: Telegram xabar yuborish (shaxsiy chat_id ga) ─────────────────
async function sendToTelegram(chatId: string, message: string) {
    try {
        const { getBot } = await import('@/lib/telegram/bot');
        const bot = await getBot();
        if (bot && chatId) {
            await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
            return true;
        }
    } catch (e) {
        console.error('[Dispatch TG]', e);
    }
    return false;
}

// POST /api/admin/recycling/dispatch — Dispetcherlash amallari
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, requestId, supervisorId, driverId } = body;

        if (!requestId) {
            return NextResponse.json({ error: 'requestId majburiy' }, { status: 400 });
        }

        const request = await prisma.recycleRequest.findUnique({
            where: { id: Number(requestId) },
            include: { point: true },
        });

        if (!request) {
            return NextResponse.json({ error: 'Ariza topilmadi' }, { status: 404 });
        }

        // ─── ACTION: Admin → Masulga yo'naltirish ────────────────────────
        if (action === 'dispatch_to_supervisor') {
            if (!supervisorId) {
                return NextResponse.json({ error: 'supervisorId majburiy' }, { status: 400 });
            }

            const supervisor = await prisma.supervisor.findUnique({ where: { id: Number(supervisorId) } });
            if (!supervisor) {
                return NextResponse.json({ error: 'Masul topilmadi' }, { status: 404 });
            }

            const updated = await prisma.recycleRequest.update({
                where: { id: Number(requestId) },
                data: {
                    supervisorId: supervisor.id,
                    status: 'dispatched',
                    dispatchedAt: new Date(),
                },
                include: { point: true },
            });

            // Masulga Telegram xabar
            if (supervisor.telegramId) {
                const msg =
                    `📋 <b>Yangi ariza yo'naltirildi #${request.id}</b>\n\n` +
                    `👤 Mijoz: ${request.name}\n` +
                    `📞 Tel: ${request.phone}\n` +
                    `📍 Hudud: ${request.point?.regionUz || ''}\n` +
                    `${request.address ? `🏠 Manzil: ${request.address}\n` : ''}` +
                    `📦 Material: ${request.material || 'Ko\'rsatilmagan'}\n` +
                    `⚖️ Taxminiy: ${request.volume ? request.volume + ' kg' : 'Noma\'lum'}\n` +
                    `🚚 Usul: ${request.pickupType === 'pickup' ? 'Kuryer chiqishi' : 'Bazaga olib keladi'}\n\n` +
                    `Iltimos, haydovchi tayinlang!`;
                await sendToTelegram(supervisor.telegramId, msg);
            }

            // Adminga Telegram xabar
            await sendTelegramMessage(
                `📤 Ariza #${request.id} → <b>${supervisor.name}</b> ga yo'naltirildi`
            );

            return NextResponse.json(updated);
        }

        // ─── ACTION: Masul → Haydovchiga tayinlash ───────────────────────
        if (action === 'assign_driver') {
            if (!driverId) {
                return NextResponse.json({ error: 'driverId majburiy' }, { status: 400 });
            }

            const driver = await prisma.driver.findUnique({ where: { id: Number(driverId) } });
            if (!driver) {
                return NextResponse.json({ error: 'Haydovchi topilmadi' }, { status: 404 });
            }

            const updated = await prisma.recycleRequest.update({
                where: { id: Number(requestId) },
                data: {
                    assignedDriverId: driver.id,
                    status: 'assigned',
                    assignedAt: new Date(),
                },
                include: { point: true, assignedDriver: true },
            });

            // Haydovchiga Telegram xabar
            if (driver.telegramId) {
                const msg =
                    `🚚 <b>Yangi ish tayinlandi! #${request.id}</b>\n\n` +
                    `👤 Mijoz: ${request.name}\n` +
                    `📞 Tel: ${request.phone}\n` +
                    `📍 Hudud: ${request.point?.regionUz || ''}\n` +
                    `${request.address ? `🏠 Manzil: ${request.address}\n` : ''}` +
                    `📦 Material: ${request.material || 'Noma\'lum'}\n` +
                    `⚖️ Taxminiy: ${request.volume ? request.volume + ' kg' : 'Noma\'lum'}\n\n` +
                    `✅ Qabul qilasizmi?`;
                await sendToTelegram(driver.telegramId, msg);
            }

            return NextResponse.json(updated);
        }

        // ─── ACTION: Haydovchi yo'lga chiqdi ─────────────────────────────
        if (action === 'driver_en_route') {
            const updated = await prisma.recycleRequest.update({
                where: { id: Number(requestId) },
                data: {
                    status: 'en_route',
                    driverEnRouteAt: new Date(),
                },
                include: { assignedDriver: true, point: true },
            });

            // Mijozga xabar (Telegram bo'lsa)
            if (request.customerTgId) {
                await sendToTelegram(
                    request.customerTgId,
                    `🚚 <b>Haydovchi yo'lga chiqdi!</b>\n\n` +
                    `Ariza #${request.id}\n` +
                    `Haydovchi: ${updated.assignedDriver?.name || 'Noma\'lum'}\n` +
                    `Tez orada yetib boradi!`
                );
            }

            // Masulga xabar
            if (request.supervisorId) {
                const sup = await prisma.supervisor.findUnique({ where: { id: request.supervisorId } });
                if (sup?.telegramId) {
                    await sendToTelegram(sup.telegramId,
                        `🚚 Ariza #${request.id} — haydovchi yo'lga chiqdi`
                    );
                }
            }

            return NextResponse.json(updated);
        }

        // ─── ACTION: Haydovchi yetib keldi ───────────────────────────────
        if (action === 'driver_arrived') {
            const updated = await prisma.recycleRequest.update({
                where: { id: Number(requestId) },
                data: {
                    status: 'arrived',
                    driverArrivedAt: new Date(),
                },
                include: { assignedDriver: true },
            });

            // Mijozga xabar
            if (request.customerTgId) {
                await sendToTelegram(
                    request.customerTgId,
                    `📍 <b>Haydovchi yetib keldi!</b>\n\n` +
                    `Ariza #${request.id}\n` +
                    `Iltimos, chiqing! Haydovchi sizni kutmoqda.`
                );
            }

            // Masulga xabar
            if (request.supervisorId) {
                const sup = await prisma.supervisor.findUnique({ where: { id: request.supervisorId } });
                if (sup?.telegramId) {
                    await sendToTelegram(sup.telegramId,
                        `📍 Ariza #${request.id} — haydovchi yetib bordi\n` +
                        `👤 Mijoz: ${request.name} | 📞 ${request.phone}`
                    );
                }
            }

            return NextResponse.json(updated);
        }

        // ─── ACTION: Yuk yig'ish boshlandi ───────────────────────────────
        if (action === 'start_collecting') {
            const updated = await prisma.recycleRequest.update({
                where: { id: Number(requestId) },
                data: { status: 'collecting' },
            });
            return NextResponse.json(updated);
        }


        return NextResponse.json({ error: 'Noto\'g\'ri action' }, { status: 400 });
    } catch (error) {
        console.error('[Dispatch POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
