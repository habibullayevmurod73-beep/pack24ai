/**
 * Ekologik yutuqlar (Achievement Badges) tizimi — Litterati uslubida
 * Jami 12 ta badge — avtomatik tekshiriladi va beriladi
 */
import { prisma } from '@/lib/prisma';
import { BadgeKey } from '@prisma/client';

// Re-export for backward compatibility
export { BadgeKey };

export interface BadgeDefinition {
    key: BadgeKey;
    nameUz: string;
    nameRu: string;
    emoji: string;
    color: string;
    descriptionUz: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    { key: BadgeKey.first_step,       nameUz: 'Birinchi qadam',   nameRu: 'Первый шаг',     emoji: '🎯', color: '#3B82F6', descriptionUz: 'Birinchi ariza yuborildi!' },
    { key: BadgeKey.kg_10_club,       nameUz: '10kg Klubi',        nameRu: 'Клуб 10кг',      emoji: '💪', color: '#10B981', descriptionUz: 'Jami 10 kg topshirdi' },
    { key: BadgeKey.kg_50_hero,       nameUz: 'Eko Qahramon',      nameRu: 'Эко-герой',      emoji: '🦸', color: '#8B5CF6', descriptionUz: 'Jami 50 kg topshirdi' },
    { key: BadgeKey.kg_100_warrior,   nameUz: 'Yuz kilogram!',     nameRu: 'Сотник',         emoji: '🏅', color: '#F59E0B', descriptionUz: 'Jami 100 kg topshirdi' },
    { key: BadgeKey.streak_7,         nameUz: '7 kunlik olov',     nameRu: '7 дней огня',    emoji: '🔥', color: '#F97316', descriptionUz: '7 kun ketma-ket faol' },
    { key: BadgeKey.streak_30,        nameUz: 'Doimiy qahramon',   nameRu: 'Постоянный',     emoji: '🌋', color: '#EF4444', descriptionUz: '30 kun ketma-ket faol' },
    { key: BadgeKey.multi_material,   nameUz: 'Rang-barang',       nameRu: 'Разнообразие',   emoji: '🎨', color: '#6366F1', descriptionUz: '3 xil material topshirdi' },
    { key: BadgeKey.referral_first,   nameUz: 'Tanituvchi',        nameRu: 'Посол',          emoji: '👥', color: '#14B8A6', descriptionUz: 'Birinchi do\'stni taklif qildi' },
    { key: BadgeKey.tree_saver,       nameUz: 'Daraxt qo\'riqchisi', nameRu: 'Хранитель лесов', emoji: '🌳', color: '#15803D', descriptionUz: '10 ta daraxt saqlab qoldi' },
    { key: BadgeKey.co2_warrior,      nameUz: 'CO₂ Jangchi',       nameRu: 'Борец с CO₂',   emoji: '💨', color: '#0EA5E9', descriptionUz: '100 kg CO₂ kamaytirdi' },
    { key: BadgeKey.early_bird,       nameUz: 'Erta turadigan',    nameRu: 'Ранняя пташка',  emoji: '🐦', color: '#FBBF24', descriptionUz: 'Ertalab ariza yubordi' },
    { key: BadgeKey.eco_legend,       nameUz: 'Eko Afsona',        nameRu: 'Эко-легенда',    emoji: '⭐', color: '#F59E0B', descriptionUz: 'Afsonaviy darajaga yetdi!' },
];

export function getBadgeInfo(key: BadgeKey): BadgeDefinition | undefined {
    return BADGE_DEFINITIONS.find(b => b.key === key);
}

/**
 * Foydalanuvchi uchun yangi badge tekshirish va berish
 * RecycleRequest completed bo'lganda chaqiriladi
 */
export async function checkAndAwardBadges(userId: number): Promise<BadgeKey[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            achievements: true,
            recycleRequests: {
                where: { status: { in: ['collected', 'completed', 'confirmed'] } },
                select: { material: true, volume: true, createdAt: true },
            },
        },
    });

    if (!user) return [];

    const existingBadges = new Set(user.achievements.map(a => a.badgeKey));
    const newBadges: BadgeKey[] = [];

    const totalKg = user.totalRecycledWeight;
    const completedCount = user.recycleRequests.length;
    const materials = new Set(user.recycleRequests.map(r => r.material).filter(Boolean));

    const toAward: BadgeKey[] = [];

    // 🎯 Birinchi qadam
    if (completedCount >= 1 && !existingBadges.has(BadgeKey.first_step)) toAward.push(BadgeKey.first_step);
    // 💪 10 kg
    if (totalKg >= 10 && !existingBadges.has(BadgeKey.kg_10_club)) toAward.push(BadgeKey.kg_10_club);
    // 🦸 50 kg
    if (totalKg >= 50 && !existingBadges.has(BadgeKey.kg_50_hero)) toAward.push(BadgeKey.kg_50_hero);
    // 🏅 100 kg
    if (totalKg >= 100 && !existingBadges.has(BadgeKey.kg_100_warrior)) toAward.push(BadgeKey.kg_100_warrior);
    // 🎨 3 xil material
    if (materials.size >= 3 && !existingBadges.has(BadgeKey.multi_material)) toAward.push(BadgeKey.multi_material);
    // 🌳 10 daraxt
    if (user.treesEquivalent >= 10 && !existingBadges.has(BadgeKey.tree_saver)) toAward.push(BadgeKey.tree_saver);
    // 💨 100 kg CO₂
    if (user.totalCO2Saved >= 100 && !existingBadges.has(BadgeKey.co2_warrior)) toAward.push(BadgeKey.co2_warrior);
    // ⭐ Legend
    if (user.ecoLevel === 'legend' && !existingBadges.has(BadgeKey.eco_legend)) toAward.push(BadgeKey.eco_legend);
    // 🔥 Streak — 7 kun
    if (user.ecoStreak >= 7 && !existingBadges.has(BadgeKey.streak_7)) toAward.push(BadgeKey.streak_7);
    // 🌋 Streak — 30 kun
    if (user.ecoStreak >= 30 && !existingBadges.has(BadgeKey.streak_30)) toAward.push(BadgeKey.streak_30);
    // 🐦 Early bird — biron ariza 06-09 oralig'ida yaratilganmi
    const hasEarlyBird = user.recycleRequests.some(r => {
        const hour = new Date(r.createdAt).getHours();
        return hour >= 6 && hour < 9;
    });
    if (hasEarlyBird && !existingBadges.has(BadgeKey.early_bird)) toAward.push(BadgeKey.early_bird);
    // 👥 Referral — kamida bir referral bor
    const referralCount = await prisma.user.count({ where: { referredById: userId } });
    if (referralCount >= 1 && !existingBadges.has(BadgeKey.referral_first)) toAward.push(BadgeKey.referral_first);

    // Badge'larni saqlash
    if (toAward.length > 0) {
        await prisma.ecoAchievement.createMany({
            data: toAward.map(key => ({ userId, badgeKey: key })),
            skipDuplicates: true,
        });
        newBadges.push(...toAward);
    }

    return newBadges;
}
