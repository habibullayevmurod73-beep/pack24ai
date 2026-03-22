import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(request: Request) {
    try {
        const order = await request.json();

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
            console.error('Telegram keys missing');
            // We return success to not block the UI, but log error
            return NextResponse.json({ success: false, error: "Server misconfiguration" });
        }

        const itemsList = order.items.map((item: any) =>
            `- ${item.name} (${item.quantity} x ${item.price.toLocaleString()} UZS)`
        ).join('\n');

        const message = `
📦 <b>Yangi Buyurtma!</b>

🆔 <b>ID:</b> <code>${order.id || 'N/A'}</code>
👤 <b>Mijoz:</b> ${order.contactName}
📞 <b>Tel:</b> ${order.contactPhone}
📍 <b>Manzil:</b> ${order.address}
📝 <b>Izoh:</b> ${order.comment || 'Yo\'q'}

🛒 <b>Mahsulotlar:</b>
${itemsList}

💰 <b>Jami:</b> <b>${order.totalAmount.toLocaleString()} UZS</b>
        `.trim();

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return NextResponse.json({ success: false, error: data.description });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Telegram notification failed:', error);
        return NextResponse.json({ success: false, error: "Internal Server Error" });
    }
}
