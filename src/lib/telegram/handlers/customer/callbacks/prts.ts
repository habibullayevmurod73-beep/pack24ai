import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { sessions, getUserByTgId } from '../helpers';
import { Lang, getText, formatText } from '../../../i18n';

export function registerPrtsCallbacks(bot: Telegraf) {
    bot.on('callback_query', async (ctx, next) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return next();
        const tgId = ctx.from.id.toString();

        // ─── PRTS INFO ───────────────────────────────────────────────
        if (data === 'prts_info') {
            const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;
            await ctx.answerCbQuery('🌿');
            await ctx.reply(getText('prts_info', lang), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '◀️ Ortga', callback_data: 'cab_prts' }, { text: '🏠 Asosiy menyu', callback_data: 'back_main' }],
                    ],
                },
            });
            return;
        }

        // ─── PRTS MUKOFOTLAR ────────────────────────────────────────────
        if (data === 'prts_rewards') {
            const user = await getUserByTgId(tgId);
            const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;
            if (!user) { await ctx.answerCbQuery('❌'); return; }

            await ctx.answerCbQuery('🎁');
            await ctx.reply(
                formatText('prts_rewards_list', lang, { points: String(user.ecoPoints || 0) }),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '☕ Kofe (150)', callback_data: 'prts_redeem_coffee_150' }],
                            [{ text: '🚌 Transport (300)', callback_data: 'prts_redeem_transport_300' }],
                            [{ text: '🎬 Kino (500)', callback_data: 'prts_redeem_cinema_500' }],
                            [{ text: '🌳 Daraxt (1000)', callback_data: 'prts_redeem_tree_1000' }],
                            [{ text: '◀️ Ortga', callback_data: 'cab_prts' }],
                        ],
                    },
                }
            );
            return;
        }

        // ─── PRTS REDEEM ───────────────────────────────────────────────
        if (data.startsWith('prts_redeem_')) {
            const user = await getUserByTgId(tgId);
            const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;
            if (!user) { await ctx.answerCbQuery('❌'); return; }

            const parts = data.replace('prts_redeem_', '').split('_');
            const rewardName = parts[0];
            const cost = parseInt(parts[1]);

            const rewardLabels: Record<string, Record<Lang, string>> = {
                coffee: { uz: '☕ Kofe 50% chegirma', ru: '☕ 50% скидка на кофе', en: '☕ 50% coffee discount' },
                transport: { uz: '🚌 Bepul transport', ru: '🚌 Бесплатный проезд', en: '🚌 Free transport' },
                cinema: { uz: '🎬 Kino chipta', ru: '🎬 Билет в кино', en: '🎬 Cinema ticket' },
                tree: { uz: '🌳 Daraxt ekish', ru: '🌳 Посадка дерева', en: '🌳 Plant a tree' },
            };

            if (user.ecoPoints < cost) {
                await ctx.answerCbQuery('❌');
                await ctx.reply(
                    formatText('prts_insufficient', lang, {
                        required: String(cost),
                        current: String(user.ecoPoints),
                        diff: String(cost - user.ecoPoints),
                    }),
                    { parse_mode: 'HTML' }
                );
                return;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { ecoPoints: { decrement: cost } },
            });

            await ctx.answerCbQuery('🎉');
            await ctx.reply(
                formatText('prts_reward_success', lang, {
                    reward: rewardLabels[rewardName]?.[lang] || rewardName,
                    spent: String(cost),
                    remaining: String(user.ecoPoints - cost),
                }),
                { parse_mode: 'HTML' }
            );
            return;
        }

        // ─── PRTS LEADERBOARD ───────────────────────────────────────────
        if (data === 'prts_leaderboard') {
            await ctx.answerCbQuery('🏆');
            const lang = (sessions.get(tgId)?.lang || 'uz') as Lang;

            // Top 10 foydalanuvchilar
            const top = await prisma.user.findMany({
                where: { totalRecycledWeight: { gt: 0 } },
                orderBy: { ecoPoints: 'desc' },
                take: 10,
                select: { name: true, ecoPoints: true, totalRecycledWeight: true, ecoLevel: true },
            });

            // Joriy foydalanuvchi
            const me = await getUserByTgId(tgId);
            const meRankResult = me ? await prisma.user.count({
                where: { ecoPoints: { gt: me.ecoPoints } },
            }) : null;
            const meRank = meRankResult !== null ? meRankResult + 1 : null;

            const medals = ['🥇', '🥈', '🥉'];
            const levelEmoji: Record<string, string> = {
                seed: '🌱', sprout: '🌿', tree: '🌳', forest: '🌲', guardian: '🌍',
            };

            const topList = top.length === 0
                ? (lang === 'uz' ? 'Hali hech kim ro\'yxatda yo\'q' : 'Список пуст')
                : top.map((u, i) => {
                    const m = medals[i] || `${i + 1}.`;
                    const lv = levelEmoji[u.ecoLevel] || '🌱';
                    return `${m} ${lv} <b>${u.name}</b> — ${u.ecoPoints} ball (${Math.round(u.totalRecycledWeight)} kg)`;
                }).join('\n');

            const myLine = me && meRank
                ? `\n\n📍 <b>Sizning o'rningiz: #${meRank}</b> — ${me.ecoPoints} ball`
                : '';

            await ctx.reply(
                `🏆 <b>${lang === 'uz' ? 'Global Reyting — Top 10' : 'Глобальный Рейтинг — Топ 10'}</b>\n\n${topList}${myLine}`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔄 Yangilash', callback_data: 'prts_leaderboard' }],
                            [{ text: '◀️ Ortga', callback_data: 'cab_prts' }],
                        ],
                    },
                }
            );
            return;
        }

        return next();
    });
}
