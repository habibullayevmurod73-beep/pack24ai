import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram/bot';

// Yordamchi
async function sendToTelegram(chatId: string, message: string) {
    try {
        const { getBot } = await import('@/lib/telegram/bot');
        const bot = await getBot();
        if (bot && chatId) {
            await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
    } catch (e) { console.error('[Collections TG]', e); }
}

function fmtMoney(n: number) {
    return n.toLocaleString('ru-RU');
}

// GET /api/admin/recycling/collections — Yig'ishlar ro'yxati
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const driverId = searchParams.get('driverId');
        const requestId = searchParams.get('requestId');
        const paymentStatus = searchParams.get('paymentStatus');
        const period = parseInt(searchParams.get('period') ?? '90');

        const from = new Date();
        from.setDate(from.getDate() - period);

        const where: Record<string, unknown> = {
            createdAt: { gte: from },
        };
        if (driverId) where.driverId = Number(driverId);
        if (requestId) where.requestId = Number(requestId);
        if (paymentStatus) where.paymentStatus = paymentStatus;

        const collections = await prisma.recycleCollection.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                request: { include: { point: true } },
                driver: true,
            },
        });
        return NextResponse.json(collections);
    } catch (error) {
        console.error('[Collections GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// POST /api/admin/recycling/collections — Yangi yig'ish hisob yaratish (kalkulator)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { requestId, driverId, actualWeight, discountPercent, pricePerKg, materialType, notes, discountReason } = body;

        if (!requestId || !driverId || !actualWeight || !pricePerKg) {
            return NextResponse.json({ error: 'requestId, driverId, actualWeight, pricePerKg majburiy' }, { status: 400 });
        }

        const weight = parseFloat(actualWeight);
        const discount = parseFloat(discountPercent || '0');
        const price = parseFloat(pricePerKg);

        // Kalkulator: effectiveWeight = actualWeight - (actualWeight * discount / 100)
        // totalAmount = effectiveWeight * pricePerKg
        const effectiveWeight = weight - (weight * discount / 100);
        const totalAmount = Math.round(effectiveWeight * price);

        const collection = await prisma.$transaction(async (tx) => {
            const existingCollection = await tx.recycleCollection.findFirst({
                where: { requestId: Number(requestId) },
                select: { id: true },
            });

            if (existingCollection) {
                throw new Error('COLLECTION_ALREADY_EXISTS');
            }

            const createdCollection = await tx.recycleCollection.create({
                data: {
                    requestId: Number(requestId),
                    driverId: Number(driverId),
                    actualWeight: weight,
                    discountPercent: discount,
                    effectiveWeight,
                    pricePerKg: price,
                    totalAmount,
                    discountReason: discountReason || null,
                    materialType: materialType || null,
                    notes: notes || null,
                    collectedAt: new Date(),
                },
                include: {
                    request: { include: { point: true } },
                    driver: true,
                },
            });

            const updatedRequest = await tx.recycleRequest.update({
                where: { id: Number(requestId) },
                data: {
                    status: 'collected',
                    collectedAt: new Date(),
                },
                select: { userId: true },
            });

            if (updatedRequest.userId) {
                await tx.user.update({
                    where: { id: updatedRequest.userId },
                    data: {
                        totalRecycledWeight: {
                            increment: effectiveWeight,
                        },
                        ecoPoints: {
                            increment: Math.max(1, Math.round(effectiveWeight)),
                        },
                    },
                });
            }

            return createdCollection;
        });

        // Mijozga Telegram xabar (ixtiyoriy)
        const request = collection.request;
        if (request.customerTgId) {
            const msg =
                `📦 <b>Makulatura yig'ildi! #${request.id}</b>\n\n` +
                `⚖️ Og'irlik: <b>${weight} kg</b>\n` +
                `${discount > 0 ? `🏷️ Chegirma: <b>${discount}%</b> (${discountReason || 'sifat'})\n` : ''}` +
                `${discount > 0 ? `📊 Hisoblangan og'irlik: <b>${effectiveWeight.toFixed(1)} kg</b>\n` : ''}` +
                `💰 Narx: <b>${fmtMoney(price)} so'm/kg</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `💵 <b>Jami: ${fmtMoney(totalAmount)} so'm</b>\n\n` +
                `Ma'lumotlar to'g'rimi?\n` +
                `✅ Tasdiqlash yoki ❌ Inkor qilish`;
            await sendToTelegram(request.customerTgId, msg);
        }

        // Masulga xabar
        if (request.supervisorId) {
            const sup = await prisma.supervisor.findUnique({ where: { id: request.supervisorId } });
            if (sup?.telegramId) {
                await sendToTelegram(sup.telegramId,
                    `📦 Ariza #${request.id} — yuk yig'ildi\n` +
                    `⚖️ ${weight} kg | 💵 ${fmtMoney(totalAmount)} so'm\n` +
                    `🚚 Haydovchi: ${collection.driver.name}`
                );
            }
        }


        // Adminga xabar
        await sendTelegramMessage(
            `📦 Yig'ish #${collection.id} yaratildi\n` +
            `Ariza #${request.id} | ${weight} kg | ${fmtMoney(totalAmount)} so'm`
        );

        return NextResponse.json(collection, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'COLLECTION_ALREADY_EXISTS') {
            return NextResponse.json(
                { error: 'Bu ariza uchun yig\'ish hisobi allaqachon yaratilgan' },
                { status: 409 }
            );
        }

        console.error('[Collections POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
