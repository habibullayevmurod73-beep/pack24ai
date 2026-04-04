import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram/bot';

async function sendToTelegram(chatId: string, message: string) {
    try {
        const { getBot } = await import('@/lib/telegram/bot');
        const bot = await getBot();
        if (bot && chatId) {
            await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
    } catch (e) { console.error('[Collection TG]', e); }
}

// PUT /api/admin/recycling/collections/[id] — yangilash, to'lov
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const existing = await prisma.recycleCollection.findUnique({
            where: { id: Number(id) },
            include: { request: true, driver: true },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Yig\'ish topilmadi' }, { status: 404 });
        }

        const updateData: Record<string, unknown> = {};

        // Mijoz tasdiqlashi
        if (body.customerConfirmed !== undefined) {
            updateData.customerConfirmed = body.customerConfirmed;
            updateData.customerComment = body.customerComment || null;

            if (body.customerConfirmed) {
                // Ariza statusini yangilash
                await prisma.recycleRequest.update({
                    where: { id: existing.requestId },
                    data: { status: 'confirmed', confirmedAt: new Date() },
                });
            } else {
                // Inkor — ariza disputed
                await prisma.recycleRequest.update({
                    where: { id: existing.requestId },
                    data: { status: 'disputed' },
                });
            }
        }

        // Punkt'ga topshirish
        if (body.deliveredToPoint !== undefined) {
            updateData.deliveredToPoint = body.deliveredToPoint;
            if (body.deliveredToPoint) {
                updateData.deliveredAt = new Date();
            }

            // Masulga va adminga xabar
            if (body.deliveredToPoint && existing.request.supervisorId) {
                const sup = await prisma.supervisor.findUnique({ where: { id: existing.request.supervisorId } });
                if (sup?.telegramId) {
                    await sendToTelegram(sup.telegramId,
                        `✅ Ariza #${existing.requestId} — yuk bazaga topshirildi\n` +
                        `⚖️ ${existing.actualWeight} kg | 🚚 ${existing.driver.name}`
                    );
                }
            }
        }

        // To'lov amalga oshirish
        if (body.paymentStatus) {
            updateData.paymentStatus = body.paymentStatus;
            updateData.paymentToDriver = body.paymentToDriver ? parseFloat(body.paymentToDriver) : null;
            updateData.paymentToCustomer = body.paymentToCustomer ? parseFloat(body.paymentToCustomer) : null;
            updateData.paymentNote = body.paymentNote || null;
            updateData.paidBy = body.paidBy || null;

            if (['paid_to_driver', 'paid_to_customer', 'paid_both', 'completed'].includes(body.paymentStatus)) {
                updateData.paidAt = new Date();

                // Ariza yakunlash
                await prisma.recycleRequest.update({
                    where: { id: existing.requestId },
                    data: { status: 'completed', completedAt: new Date() },
                });

                // Haydovchiga xabar
                if (existing.driver.telegramId && body.paymentToDriver) {
                    await sendToTelegram(existing.driver.telegramId,
                        `💰 Sizga ${parseFloat(body.paymentToDriver).toLocaleString('ru-RU')} so'm to'landi ✅\n` +
                        `Ariza #${existing.requestId}`
                    );
                }

                // Mijozga xabar
                if (existing.request.customerTgId && body.paymentToCustomer) {
                    await sendToTelegram(existing.request.customerTgId,
                        `💰 Sizga ${parseFloat(body.paymentToCustomer).toLocaleString('ru-RU')} so'm to'landi ✅\n` +
                        `Ariza #${existing.requestId}\n\nRahmat! ♻️`
                    );
                }

                // Adminga xabar
                await sendTelegramMessage(
                    `✅ Ariza #${existing.requestId} to'liq yakunlandi\n` +
                    `💵 ${existing.totalAmount.toLocaleString('ru-RU')} so'm`
                );
            }
        }

        // Eslatma
        if (body.notes !== undefined) updateData.notes = body.notes;

        const updated = await prisma.recycleCollection.update({
            where: { id: Number(id) },
            data: updateData,
            include: { request: { include: { point: true } }, driver: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[Collection PUT]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
