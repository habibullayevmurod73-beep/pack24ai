import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createTelegramSessionStore } from '../../sessionStore';
import { pack24AdminMainKeyboard } from '../../keyboards';
import type { Pack24AdminSession, AccessIdentity } from './types';

export const sessions = createTelegramSessionStore<Pack24AdminSession>('pack24admin-bot-sessions');

export function normalizePhone(phone: string): string {
    let normalized = phone.replace(/[^0-9+]/g, '');
    if (!normalized.startsWith('+')) normalized = `+${normalized}`;
    return normalized;
}

export async function getHqAdminByTelegramId(tgId: string) {
    return prisma.telegramHqAdmin.findFirst({
        where: { telegramId: tgId, isActive: true },
    });
}

export async function getHqAdminByPhone(phone: string) {
    return prisma.telegramHqAdmin.findFirst({
        where: {
            OR: [
                { phone },
                { phone: phone.replace('+', '') },
                { phone: phone.replace('+998', '0') },
                { phone: phone.slice(-9) },
            ],
        },
    });
}

export function getStaticAllowedIds(): string[] {
    return (process.env.PACK24ADMIN_ALLOWED_TELEGRAM_IDS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}

export async function getAccessIdentity(tgId: string): Promise<AccessIdentity | null> {
    const dbAdmin = await getHqAdminByTelegramId(tgId);
    if (dbAdmin) {
        return {
            kind: 'db',
            id: dbAdmin.id,
            name: dbAdmin.name,
            phone: dbAdmin.phone,
            telegramId: dbAdmin.telegramId,
            registrationCode: dbAdmin.registrationCode,
            isActive: dbAdmin.isActive,
        };
    }

    if (getStaticAllowedIds().includes(tgId)) {
        return {
            kind: 'static',
            id: null,
            name: 'System Admin',
            phone: null,
            telegramId: tgId,
            registrationCode: null,
            isActive: true,
        };
    }

    return null;
}

export function formatEventRows(events: Array<{
    id: number;
    title: string;
    message: string;
    sourceBot: string;
    severity: string;
    createdAt: Date;
    requestId: number | null;
}>): string {
    if (events.length === 0) {
        return 'Hozircha hodisalar yo\'q.';
    }

    return events.map((event, index) => {
        const icon = event.severity === 'error'
            ? '🚨'
            : event.severity === 'warning'
            ? '⚠️'
            : event.severity === 'success'
            ? '✅'
            : 'ℹ️';

        return (
            `${index + 1}. ${icon} <b>${event.title}</b>\n` +
            `🤖 ${event.sourceBot} • ${event.createdAt.toLocaleString('ru-RU')}\n` +
            `${event.requestId ? `📋 Ariza #${event.requestId}\n` : ''}` +
            `${event.message}`
        );
    }).join('\n\n');
}

export async function replyWithMenu(ctx: Context, hqAdminName: string) {
    const unreadCount = await prisma.botEvent.count({
        where: { status: 'new' },
    });

    await ctx.reply(
        `🏢 <b>Pack24 Admin botiga xush kelibsiz</b>\n\n` +
        `👤 ${hqAdminName}\n` +
        `📨 Yangi hodisalar: <b>${unreadCount}</b>\n\n` +
        `Kerakli bo'limni tanlang.`,
        {
            parse_mode: 'HTML',
            reply_markup: pack24AdminMainKeyboard(),
        },
    );
}

export async function touchDbAdmin(identity: AccessIdentity) {
    if (identity.kind !== 'db') return;

    await prisma.telegramHqAdmin.update({
        where: { id: identity.id },
        data: { lastSeenAt: new Date() },
    });
}
