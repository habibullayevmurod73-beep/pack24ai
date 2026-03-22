import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBot } from '@/lib/telegram/bot';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }

        // Parse gallery for products in items
        const parsedOrder = {
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                product: {
                    ...item.product,
                    gallery: item.product.gallery ? JSON.parse(item.product.gallery) : []
                }
            }))
        };

        return NextResponse.json(parsedOrder);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Update order
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: body,
            include: { items: { include: { product: true } } }
        });

        // If status changed to 'new', send telegram notification
        if (body.status === 'new' && updatedOrder.status === 'new') {
            try {
                const bot = await getBot();
                if (bot) {
                    const adminConfig = await prisma.telegramConfig.findFirst();
                    // Assuming we notify a specific channel or admin. 
                    // For now, let's just log it or send to the user if telegramUserId exists
                    // In a real scenario, we might want to send to an admin group.

                    if (updatedOrder.telegramUserId) {
                        await bot.telegram.sendMessage(updatedOrder.telegramUserId,
                            `✅ Buyurtmangiz qabul qilindi! ID: #${updatedOrder.id}\nTez orada aloqaga chiqamiz.`
                        );
                    }

                    // TODO: Notify admins. We need an admin ID in the config.
                }
            } catch (tgError) {
                console.error('Failed to send telegram notification:', tgError);
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
