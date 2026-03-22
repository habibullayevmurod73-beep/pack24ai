import { NextResponse } from 'next/server';

// Telegramdan keladigan ma'lumot turlari
interface TelegramUpdate {
    message?: {
        chat: { id: number; first_name: string; last_name?: string; username?: string };
        text?: string;
    };
}

export async function POST(request: Request) {
    try {
        const update: TelegramUpdate = await request.json();

        if (!update.message) return NextResponse.json({ ok: true });

        const chatId = update.message.chat.id;
        const text = update.message.text;
        const firstName = update.message.chat.first_name;

        // 1. MIJOZNI CRM BAZASIDA TEKSHIRISH YOKI YARATISH
        // Bu yerda DB call bo'lishi kerak. Masalan: const user = await db.user.findUnique(...)
        console.log(`Mijoz: ${firstName} (ID: ${chatId}) xabar yubordi: ${text}`);

        // 2. BUYURTMA MANTIQI (ASALARI MEXANIZMI)
        if (text?.toLowerCase().includes('buyurtma')) {
            // Avtomatik buyurtma kartochkasini yaratish simulyatsiyasi
            const newOrder = {
                id: `ORD-${Date.now()}`,
                customer: firstName,
                status: 'pending', // Kutilmoqda
                type: 'individual', // Standart yoki Individual
            };

            // 3. JAMOAVIY VAZIFA YARATISH (AUTOMATIC TASK ASSIGNMENT)
            // Masalan: await db.task.create({ data: { title: "Yangi buyurtmani tekshirish", assignee: "Operator" } })

            await sendTelegramMessage(chatId, `Assalomu alaykum, ${firstName}! Buyurtmangiz qabul qilindi (ID: ${newOrder.id}). Tez orada operatorimiz siz bilan bog'lanadi.`);
        } else {
            await sendTelegramMessage(chatId, "Pack24 tizimiga xush kelibsiz! Buyurtma berish uchun 'Buyurtma' so'zini yozing yoki menyudan foydalaning.");
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Webhook xatosi:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Telegramga javob qaytarish funksiyasi
async function sendTelegramMessage(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.warn("TELEGRAM_BOT_TOKEN is not set in environment variables.");
        return;
    }
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text }),
    });
}
