import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

/**
 * PRTS — Chiqindi olib ketish buyurtmasi
 */
export async function POST(request: NextRequest) {
    try {
        const guard = await requireUser();
        if (!guard.ok) return guard.response;

        const { material, weight, address } = await request.json();
        if (!material || !weight || !address) {
            return NextResponse.json({ error: "Barcha maydonlar to'ldirilishi kerak" }, { status: 400 });
        }

        // Save as a BotEvent for admin notification
        await prisma.botEvent.create({
            data: {
                sourceBot: "platform",
                eventType: "prts_pickup_request",
                severity: "info",
                entityType: "user",
                entityId: Number(guard.user.id),
                title: "PRTS Pickup Request",
                message: `PRTS Pickup: ${material} | ${weight}kg | ${address}`,
                status: "new_",
            },
        });

        return NextResponse.json({ ok: true, message: "Buyurtma qabul qilindi" });
    } catch (error) {
        console.error("PRTS pickup error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
