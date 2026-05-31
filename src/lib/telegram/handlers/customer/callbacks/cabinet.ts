import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { sessions, getUserByTgId } from '../helpers';
import { Lang, formatText } from '../../../i18n';
import { toNumber } from '@/lib/money';

export function registerCabinetCallbacks(bot: Telegraf) {
    bot.on('callback_query', async (ctx, next) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data || !data.startsWith('cab_')) return next();
        const tgId = ctx.from.id.toString();

        // KABINET TUGMALARI
        const user = await getUserByTgId(tgId);
        const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;

        if (!user) {
            await ctx.answerCbQuery('❌');
            return;
        }

        // ─── PRTS Dashboard ───────────────────────────────────────
        if (data === 'cab_prts') {
            await ctx.answerCbQuery('🌿');
            const totalWeight = user.totalRecycledWeight || 0;
            await ctx.reply(
                formatText('prts_dashboard', lang, {
                    name: user.name,
                    weight: String(totalWeight),
                    co2: (totalWeight * 2.5).toFixed(1),
                    trees: (totalWeight * 0.017).toFixed(1),
                    water: (totalWeight * 26).toFixed(0),
                    points: String(user.ecoPoints || 0),
                }),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎁 Mukofotlar', callback_data: 'prts_rewards' },
                                { text: '♻️ Topshirish', callback_data: 'cab_recycling' },
                            ],
                            [
                                { text: '🏆 Reyting', callback_data: 'prts_leaderboard' },
                                { text: 'ℹ️ PRTS nima?', callback_data: 'prts_info' },
                            ],
                            [{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }],
                        ],
                    },
                }
            );
            return;
        }

        if (data === 'cab_show_code') {
            await ctx.answerCbQuery('🔑');
            await ctx.reply(
                lang === 'uz'
                    ? `🔑 <b>Kirish kodingiz:</b> <code>${user.telegramCode || '—'}</code>\n\n📱 Telefon: <b>${user.phone}</b>\n\n🌐 <b>pack24.ai</b> saytida ushbu kod va telefon bilan kiring.`
                    : lang === 'ru'
                    ? `🔑 <b>Ваш код входа:</b> <code>${user.telegramCode || '—'}</code>\n\n📱 Телефон: <b>${user.phone}</b>\n\n🌐 Войдите на <b>pack24.ai</b> с этим кодом и телефоном.`
                    : `🔑 <b>Your login code:</b> <code>${user.telegramCode || '—'}</code>\n\n📱 Phone: <b>${user.phone}</b>\n\n🌐 Use this code at <b>pack24.ai</b> to login.`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }]] } }
            );
            return;
        }

        if (data === 'cab_recycling') {
            await ctx.answerCbQuery('♻️');
            const reqs = await prisma.recycleRequest.findMany({
                where: { customerTgId: tgId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { point: true },
            });
            if (reqs.length === 0) {
                await ctx.reply(lang === 'uz' ? '♻️ Hali makulatura topshirmadingiz.' : '♻️ Нет истории сдачи макулатуры.');
                return;
            }
            const stMap: Record<string, string> = { new: '🔵', dispatched: '📋', assigned: '🚚', en_route: '🚚', arrived: '📍', collecting: '⚖️', completed: '✅', cancelled: '❌' };
            const list = reqs.map(r => `${stMap[r.status] || '⚪'} <b>#${r.id}</b> — ${r.point?.regionUz || '—'} — ${new Date(r.createdAt).toLocaleDateString('ru-RU')}`).join('\n');
            await ctx.reply(`♻️ <b>${lang === 'uz' ? 'Makulatura tarixi' : 'История макулатуры'}:</b>\n\n${list}`, {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }]] },
            });
            return;
        }

        if (data === 'cab_orders') {
            await ctx.answerCbQuery('📦');
            const orders = await prisma.order.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });
            if (orders.length === 0) {
                await ctx.reply(lang === 'uz' ? '📦 Hali buyurtma bermagansiz.' : '📦 Нет заказов.');
                return;
            }
            const list = orders.map(o => `📦 <b>#${o.id}</b> — ${o.status} — ${toNumber(o.totalAmount).toLocaleString('ru-RU')} so'm — ${new Date(o.createdAt).toLocaleDateString('ru-RU')}`).join('\n');
            await ctx.reply(`📦 <b>${lang === 'uz' ? 'Buyurtmalaringiz' : 'Ваши заказы'}:</b>\n\n${list}`, {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }]] },
            });
            return;
        }

        if (data === 'cab_referral') {
            await ctx.answerCbQuery('👥');
            const refCount = await prisma.user.count({ where: { referredById: user.id } });
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.ai';
            await ctx.reply(
                lang === 'uz'
                    ? `👥 <b>Referral dastur</b>\n\nSizning kod: <code>${user.referralCode || '—'}</code>\nTaklif qilganlar: <b>${refCount} kishi</b>\n\n🔗 Havola: ${appUrl}/referral?ref=${user.referralCode || ''}`
                    : `👥 <b>Реферальная программа</b>\n\nВаш код: <code>${user.referralCode || '—'}</code>\nПриглашено: <b>${refCount} чел.</b>\n\n🔗 Ссылка: ${appUrl}/referral?ref=${user.referralCode || ''}`,
                { parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }]] } }
            );
            return;
        }

        if (data === 'cab_settings') {
            await ctx.answerCbQuery('⚙️');
            await ctx.reply(
                lang === 'uz'
                    ? `⚙️ <b>Sozlamalar</b>\n\n👤 Ism: <b>${user.name}</b>\n📱 Telefon: <b>${user.phone}</b>\n🌐 Til: O'zbek\n\n🔑 <b>Kirish kodi:</b> <code>${user.telegramCode || '—'}</code>\n🌐 <b>pack24.ai</b> saytida shu kod va telefon bilan kiring.\n\n✏️ O'zgartirish uchun <b>pack24.ai</b> saytiga kiring.`
                    : lang === 'ru'
                    ? `⚙️ <b>Настройки</b>\n\n👤 Имя: <b>${user.name}</b>\n📱 Телефон: <b>${user.phone}</b>\n\n🔑 <b>Код входа:</b> <code>${user.telegramCode || '—'}</code>\n🌐 Войдите на <b>pack24.ai</b> с этим кодом.\n\n✏️ Для изменений войдите на <b>pack24.ai</b>`
                    : `⚙️ <b>Settings</b>\n\n👤 Name: <b>${user.name}</b>\n📱 Phone: <b>${user.phone}</b>\n\n🔑 <b>Login code:</b> <code>${user.telegramCode || '—'}</code>\n🌐 Use this code at <b>pack24.ai</b> to login.`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ Asosiy menyu', callback_data: 'back_main' }]] } }
            );
            return;
        }

        await ctx.answerCbQuery();
        return;
    });
}
