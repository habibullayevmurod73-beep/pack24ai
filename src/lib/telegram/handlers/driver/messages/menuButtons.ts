import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { getDriver } from '../helpers';
import { Lang, getText, formatText } from '../../../i18n';
import { btn, driverMainKeyboard } from '../../../keyboards';
import { createBotEvent } from '../../../botEvents';
import { fmtN } from '../types';
import { toNumber } from '@/lib/money';

export function registerMenuButtonHandlers(bot: Telegraf) {
    bot.on('text', async (ctx, next) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (text.startsWith('/')) return next();

        const driver = await getDriver(tgId);
        if (!driver) {
            await ctx.reply(
                '❌ Siz haydovchi sifatida ro\'yxatdan o\'tmagansiz.\n\n/start bosing va telefon raqamingizni ulashing.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        const lang: Lang = 'uz';

        if (text === getText('drv_btn_tasks', lang) || text === getText('drv_btn_tasks', 'ru') || text === getText('drv_btn_tasks', 'en')) {
            const tasks = await prisma.recycleRequest.findMany({
                where: {
                    assignedDriverId: driver.id,
                    status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] },
                },
                include: { point: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            if (tasks.length === 0) {
                await ctx.reply(getText('drv_no_tasks', lang));
                return;
            }

            for (const task of tasks) {
                const volLabel = task.volumeSize === 'small' ? '📦 Kichik' :
                    task.volumeSize === 'medium' ? '📦📦 O\'rta' : '📦📦📦 Katta';
                const info = formatText('drv_task_info', lang, {
                    id: String(task.id),
                    name: task.name,
                    phone: task.phone,
                    region: task.point?.regionUz || '—',
                    address: task.address || 'Kiritilmagan',
                    volume: volLabel,
                    photo: task.photoUrl ? 'Bor ✅' : 'Yo\'q',
                    time: new Date(task.createdAt).toLocaleString('ru-RU'),
                });

                const buttons: Array<Array<{ text: string; callback_data: string } | { text: string; url: string }>> = [];
                
                if (task.pickupLat && task.pickupLng) {
                    buttons.push([{ text: '🗺 Xaritada ochish', url: `https://yandex.com/maps/?pt=${task.pickupLng},${task.pickupLat}&z=16&l=map` }]);
                }

                if (task.status === 'assigned') {
                    buttons.push([
                        btn('✅ Qabul', `accept_${task.id}`),
                        btn('❌ Rad', `reject_${task.id}`),
                    ]);
                    buttons.push([btn('🚚 Yo\'lga chiqdim', `enroute_${task.id}`)]);
                } else if (task.status === 'en_route') {
                    buttons.push([btn('📍 Yetib keldim', `arrived_${task.id}`)]);
                } else if (task.status === 'arrived') {
                    buttons.push([btn('⚖️ Kalkulyator', `calc_${task.id}`)]);
                    buttons.push([btn('🚫 Bekor qilish', `cancel_${task.id}`)]);
                } else if (task.status === 'collecting') {
                    buttons.push([btn('✅ Yakunlash', `complete_${task.id}`)]);
                }

                await ctx.reply(info, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: buttons },
                });
            }
            return;
        }

        if (text === getText('drv_btn_online', lang) || text === getText('drv_btn_online', 'ru') || text === getText('drv_btn_online', 'en')) {
            await prisma.driver.update({
                where: { id: driver.id },
                data: { isOnline: true, lastSeenAt: new Date(), status: 'active' },
            });
            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'driver.online',
                entityType: 'driver',
                entityId: driver.id,
                title: 'Haydovchi online holatga o\'tdi',
                message: `${driver.name} online holatga o'tdi.`,
                driverId: driver.id,
                supervisorId: driver.supervisorId ?? undefined,
                pointId: driver.pointId ?? undefined,
            });
            await ctx.reply('🟢 Siz endi <b>online</b>siz!', {
                parse_mode: 'HTML',
                reply_markup: driverMainKeyboard(true, lang),
            });
            return;
        }

        if (text === getText('drv_btn_offline', lang) || text === getText('drv_btn_offline', 'ru') || text === getText('drv_btn_offline', 'en')) {
            await prisma.driver.update({
                where: { id: driver.id },
                data: { isOnline: false, lastSeenAt: new Date(), status: 'inactive' },
            });
            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'driver.offline',
                entityType: 'driver',
                entityId: driver.id,
                severity: 'warning',
                title: 'Haydovchi offline holatga o\'tdi',
                message: `${driver.name} offline holatga o'tdi.`,
                driverId: driver.id,
                supervisorId: driver.supervisorId ?? undefined,
                pointId: driver.pointId ?? undefined,
            });
            await ctx.reply('🔴 Siz endi <b>offline</b>siz.', {
                parse_mode: 'HTML',
                reply_markup: driverMainKeyboard(false, lang),
            });
            return;
        }

        if (text === getText('drv_btn_report', lang) || text === getText('drv_btn_report', 'ru') || text === getText('drv_btn_report', 'en')) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayTasks = await prisma.recycleRequest.count({
                where: {
                    assignedDriverId: driver.id,
                    assignedAt: { gte: today },
                },
            });

            const todayCompleted = await prisma.recycleRequest.count({
                where: {
                    assignedDriverId: driver.id,
                    status: { in: ['completed', 'collecting'] },
                    completedAt: { gte: today },
                },
            });

            const collections = await prisma.recycleCollection.findMany({
                where: {
                    driverId: driver.id,
                    createdAt: { gte: today },
                },
            });

            const totalWeight = collections.reduce((s, c) => s + c.actualWeight, 0);
            const totalAmount = collections.reduce((s, c) => s + toNumber(c.totalAmount), 0);

            await ctx.reply(
                formatText('drv_report', lang, {
                    date: new Date().toLocaleDateString('ru-RU'),
                    tasks: String(todayTasks),
                    completed: String(todayCompleted),
                    weight: String(Math.round(totalWeight * 10) / 10),
                    amount: fmtN(Math.round(totalAmount)),
                }),
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (text === getText('drv_btn_profile', lang) || text === getText('drv_btn_profile', 'ru') || text === getText('drv_btn_profile', 'en')) {
            const totalCollections = await prisma.recycleCollection.count({
                where: { driverId: driver.id },
            });
            const totalWeight = await prisma.recycleCollection.aggregate({
                where: { driverId: driver.id },
                _sum: { actualWeight: true },
            });

            await ctx.reply(
                `👤 <b>Profilingiz</b>\n\n` +
                `📛 Ism: <b>${driver.name}</b>\n` +
                `📞 Telefon: ${driver.phone}\n` +
                `🚗 Mashina: ${driver.vehicleInfo || 'Ko\'rsatilmagan'}\n` +
                `📊 Holat: ${driver.isOnline ? '🟢 Online' : '🔴 Offline'}\n\n` +
                `📈 <b>Statistika:</b>\n` +
                `🔢 Jami yig\'ishlar: ${totalCollections}\n` +
                `⚖️ Jami og\'irlik: ${fmtN(Math.round((totalWeight._sum.actualWeight || 0) * 10) / 10)} kg\n` +
                `📅 Ro\'yxatdan: ${driver.registeredAt ? new Date(driver.registeredAt).toLocaleDateString('ru-RU') : '—'}`,
                { parse_mode: 'HTML' }
            );
            return;
        }
    });
}
