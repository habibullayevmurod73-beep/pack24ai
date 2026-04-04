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
    } catch (e) { console.error('[Complaints TG]', e); }
}

// GET /api/admin/recycling/complaints — Shikoyatlar ro'yxati
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const level = searchParams.get('level');

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (level) where.level = level;

        const complaints = await prisma.recycleComplaint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                request: { include: { point: true, assignedDriver: true } },
            },
        });
        return NextResponse.json(complaints);
    } catch (error) {
        console.error('[Complaints GET]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// POST /api/admin/recycling/complaints — Yangi shikoyat (mijozdan)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { requestId, fromPhone, fromName, message, level } = body;

        if (!requestId || !fromPhone || !message) {
            return NextResponse.json({ error: 'requestId, telefon va xabar majburiy' }, { status: 400 });
        }

        const complaint = await prisma.recycleComplaint.create({
            data: {
                requestId: Number(requestId),
                fromPhone,
                fromName: fromName || 'Mijoz',
                level: level || 'supervisor',
                message,
            },
            include: { request: { include: { point: true } } },
        });

        // Xabar yuborish
        if (complaint.level === 'supervisor' && complaint.request.supervisorId) {
            const sup = await prisma.supervisor.findUnique({
                where: { id: complaint.request.supervisorId },
            });
            if (sup?.telegramId) {
                await sendToTelegram(sup.telegramId,
                    `⚠️ <b>Shikoyat! Ariza #${complaint.requestId}</b>\n\n` +
                    `👤 ${complaint.fromName}\n📞 ${complaint.fromPhone}\n\n` +
                    `💬 "${complaint.message}"\n\n` +
                    `Iltimos, tezda hal qiling!`
                );
            }
        }

        // Director (=Admin) darajasidagi shikoyat
        if (complaint.level === 'director') {
            await sendTelegramMessage(
                `🚨 <b>ESKALATSIYA! Ariza #${complaint.requestId}</b>\n\n` +
                `👤 ${complaint.fromName} | 📞 ${complaint.fromPhone}\n` +
                `📍 ${complaint.request.point?.regionUz || ''}\n\n` +
                `💬 "${complaint.message}"\n\n` +
                `Mijoz masul bilan hal qila olmadi — sizga murojaat qildi!`
            );
        }

        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        console.error('[Complaints POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// PUT /api/admin/recycling/complaints — Javob berish
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, response, respondedBy } = body;

        if (!id) {
            return NextResponse.json({ error: 'id majburiy' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (response) updateData.response = response;
        if (respondedBy) updateData.respondedBy = respondedBy;
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedAt = new Date();
        }

        const complaint = await prisma.recycleComplaint.update({
            where: { id: Number(id) },
            data: updateData,
            include: { request: true },
        });

        // Mijozga javob xabari
        if (response && complaint.request.customerTgId) {
            await sendToTelegram(complaint.request.customerTgId,
                `📋 <b>Shikoyatingizga javob berildi</b>\n\n` +
                `Ariza #${complaint.requestId}\n\n` +
                `💬 "${response}"\n\n` +
                `${status === 'resolved' ? '✅ Masala hal qilindi' : '🔄 Ko\'rib chiqilmoqda'}`
            );
        }

        return NextResponse.json(complaint);
    } catch (error) {
        console.error('[Complaints PUT]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
