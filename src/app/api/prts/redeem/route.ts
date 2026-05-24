import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

/**
 * PRTS — Mukofot almashtirish (ball sarflash)
 */

const REWARDS = [
    { id: "coffee", cost: 150, uz: "☕ Kofe uchun 50% chegirma", ru: "☕ 50% скидка на кофе", en: "☕ 50% coffee discount" },
    { id: "transport", cost: 300, uz: "🚌 Jamoat transporti bepul", ru: "🚌 Бесплатный проезд", en: "🚌 Free public transport pass" },
    { id: "cinema", cost: 500, uz: "🎬 Kino chipta", ru: "🎬 Билет в кино", en: "🎬 Cinema ticket" },
    { id: "tree", cost: 1000, uz: "🌳 Daraxt ekish xayriyasi", ru: "🌳 Посадка дерева", en: "🌳 Plant a tree donation" },
];

export async function POST(request: NextRequest) {
    try {
        const guard = await requireUser();
        if (!guard.ok) return guard.response;
        const userId = Number(guard.user.id);

        const body = await request.json();
        const { rewardId } = body;

        const reward = REWARDS.find(r => r.id === rewardId);
        if (!reward) {
            return NextResponse.json({ error: "Noto'g'ri mukofot" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
        }

        if (user.ecoPoints < reward.cost) {
            return NextResponse.json({
                error: "Ball yetarli emas",
                required: reward.cost,
                current: user.ecoPoints,
            }, { status: 400 });
        }

        // Ballarni kamaytirish
        await prisma.user.update({
            where: { id: userId },
            data: { ecoPoints: { decrement: reward.cost } },
        });

        return NextResponse.json({
            success: true,
            reward: reward.uz,
            spent: reward.cost,
            remaining: user.ecoPoints - reward.cost,
        });
    } catch (error) {
        console.error("PRTS redeem error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ rewards: REWARDS });
}
