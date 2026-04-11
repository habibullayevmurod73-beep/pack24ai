import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { Lang, getText, formatText } from './i18n';
import { notifyCustomer, notifyAdmin } from './notifier';

// ─── Session types ────────────────────────────────────────────────────────────
interface DriverSession {
    step: 'code' | 'menu' | 'weight' | 'discount';
    lang: Lang;
    driverId?: number;
    activeRequestId?: number;
    weight?: number;
    discount?: number;
}

const sessions = new Map<string, DriverSession>();
const fmtN = (n: number) => n.toLocaleString('ru-RU');

// ─── Inline button helper ─────────────────────────────────────────────────────
function btn(text: string, data: string) {
    return { text, callback_data: data };
}

// ─── Haydovchini bazadan olish ────────────────────────────────────────────────
async function getDriver(tgId: string) {
    return prisma.driver.findFirst({ where: { telegramId: tgId } });
}

// ─── Haydovchi bosh menyu ─────────────────────────────────────────────────────
function driverKeyboard(lang: Lang, isOnline: boolean) {
    return {
        keyboard: [
            [{ text: getText('drv_btn_tasks', lang) }],
            [{ text: isOnline ? getText('drv_btn_offline', lang) : getText('drv_btn_online', lang) }],
            [{ text: getText('drv_btn_report', lang) }, { text: getText('drv_btn_profile', lang) }],
        ],
        resize_keyboard: true,
    };
}

// ─── Driver Bot init ──────────────────────────────────────────────────────────
let driverBotInstance: Telegraf | null = null;

export async function initDriverBot(): Promise<Telegraf | null> {
    if (driverBotInstance) return driverBotInstance;

    const token = process.env.DRIVER_BOT_TOKEN;
    if (!token) {
        console.warn('[DriverBot] DRIVER_BOT_TOKEN topilmadi');
        return null;
    }

    const bot = new Telegraf(token);

    // Commands menu
    await bot.telegram.setMyCommands([
        { command: 'start', description: '🏠 Bosh menyu / Главное меню / Main menu' },
        { command: 'help', description: '❓ Yordam / Помощь / Help' },
    ]).catch(() => {});

    // Middleware — log
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        console.log(`[DriverBot] ${ctx.updateType} in ${Date.now() - start}ms`);
    });

    // ══════════════════════════════════════════════════════════════════════
    // /start — Kod bilan kirish yoki bosh menyu
    // ══════════════════════════════════════════════════════════════════════
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await getDriver(tgId);

        if (driver) {
            // Qaytgan haydovchi
            const lang: Lang = 'uz';
            await ctx.reply(
                formatText('drv_registered', lang, { name: driver.name }),
                { parse_mode: 'HTML', reply_markup: driverKeyboard(lang, driver.isOnline) }
            );
            return;
        }

        // Yangi foydalanuvchi — kod so'rash
        sessions.set(tgId, { step: 'code', lang: 'uz' });
        await ctx.reply(getText('drv_welcome', 'uz'), { parse_mode: 'HTML' });
    });

    // ══════════════════════════════════════════════════════════════════════
    // /help
    // ══════════════════════════════════════════════════════════════════════
    bot.help(async (ctx) => {
        await ctx.reply(
            '🚚 <b>Pack24 — Haydovchi boti</b>\n\n' +
            '📋 Topshiriqlar — tayinlangan arizalar\n' +
            '✅ Qabul / ❌ Rad — qabul yoki rad qilish\n' +
            '🚚 Yo\'lga chiqdim — harakat boshlanishi\n' +
            '📍 Yetib keldim — yetib kelganingiz\n' +
            '⚖️ Kalkulyator — og\'irlik hisob-kitobi\n' +
            '📊 Kunlik hisobot — bugungi natijalar\n\n' +
            '/start — Bosh menyu',
            { parse_mode: 'HTML' }
        );
    });

    // ══════════════════════════════════════════════════════════════════════
    // CALLBACK QUERY HANDLER
    // ══════════════════════════════════════════════════════════════════════
    bot.on('callback_query', async (ctx) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return;
        const tgId = ctx.from.id.toString();

        try {
            const driver = await getDriver(tgId);
            if (!driver) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
                return;
            }

            // ── TOPSHIRIQNI QABUL QILISH ────────────────────────────────
            if (data.startsWith('accept_')) {
                const reqId = parseInt(data.replace('accept_', ''));
                const request = await prisma.recycleRequest.findUnique({
                    where: { id: reqId },
                    include: { point: true },
                });
                if (!request || request.assignedDriverId !== driver.id) {
                    await ctx.answerCbQuery('❌ Topshiriq topilmadi');
                    return;
                }

                // Status yangilash
                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'assigned', assignedAt: new Date() },
                });

                await prisma.driver.update({
                    where: { id: driver.id },
                    data: { status: 'busy' },
                });

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    formatText('drv_accepted', 'uz', { id: String(reqId) }),
                    { parse_mode: 'HTML' }
                );

                // Mijozga xabar
                if (request.customerTgId) {
                    const lang = (request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        request.customerTgId,
                        formatText('notif_driver_assigned', lang, {
                            driver: driver.name,
                            phone: driver.phone,
                        })
                    );
                }
                return;
            }

            // ── TOPSHIRIQNI RAD ETISH ───────────────────────────────────
            if (data.startsWith('reject_')) {
                const reqId = parseInt(data.replace('reject_', ''));
                const request = await prisma.recycleRequest.findUnique({
                    where: { id: reqId },
                    include: { point: { include: { supervisors: { where: { isActive: true }, take: 1 } } } },
                });
                if (!request || request.assignedDriverId !== driver.id) {
                    await ctx.answerCbQuery('❌');
                    return;
                }

                // Haydovchini bo'shatish, arizani qaytarish
                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'new', assignedDriverId: null, assignedAt: null },
                });
                await prisma.driver.update({
                    where: { id: driver.id },
                    data: { status: 'active' },
                });

                await ctx.answerCbQuery('❌');
                await ctx.editMessageText(
                    formatText('drv_rejected', 'uz', { id: String(reqId) }),
                    { parse_mode: 'HTML' }
                );

                // Masulga xabar
                const sup = request.point?.supervisors?.[0];
                if (sup?.telegramId) {
                    await notifyAdmin(
                        sup.telegramId,
                        `⚠️ Haydovchi <b>${driver.name}</b> topshiriq <b>#${reqId}</b> ni rad etdi.\n\nQayta tayinlang.`
                    );
                }
                return;
            }

            // ── YO'LGA CHIQDIM ──────────────────────────────────────────
            if (data.startsWith('enroute_')) {
                const reqId = parseInt(data.replace('enroute_', ''));
                const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
                if (!request || request.assignedDriverId !== driver.id) {
                    await ctx.answerCbQuery('❌');
                    return;
                }

                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'en_route', driverEnRouteAt: new Date() },
                });

                await ctx.answerCbQuery('🚚');
                await ctx.editMessageText(getText('drv_en_route', 'uz'), {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [btn('📍 Yetib keldim', `arrived_${reqId}`)],
                        ],
                    },
                });

                // Mijozga xabar
                if (request.customerTgId) {
                    const lang = (request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        request.customerTgId,
                        formatText('notif_en_route', lang, { driver: driver.name })
                    );
                }
                return;
            }

            // ── YETIB KELDIM ────────────────────────────────────────────
            if (data.startsWith('arrived_')) {
                const reqId = parseInt(data.replace('arrived_', ''));
                const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
                if (!request || request.assignedDriverId !== driver.id) {
                    await ctx.answerCbQuery('❌');
                    return;
                }

                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'arrived', driverArrivedAt: new Date() },
                });

                await ctx.answerCbQuery('📍');
                await ctx.editMessageText(getText('drv_arrived', 'uz'), {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [btn('⚖️ Kalkulyator', `calc_${reqId}`)],
                        ],
                    },
                });

                // Mijozga xabar
                if (request.customerTgId) {
                    const lang = (request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        request.customerTgId,
                        formatText('notif_arrived', lang, { driver: driver.name })
                    );
                }
                return;
            }

            // ── KALKULYATOR BOSHLASH ────────────────────────────────────
            if (data.startsWith('calc_')) {
                const reqId = parseInt(data.replace('calc_', ''));
                const ses = sessions.get(tgId) || { step: 'menu' as const, lang: 'uz' as Lang };
                ses.step = 'weight';
                ses.activeRequestId = reqId;
                ses.driverId = driver.id;
                sessions.set(tgId, ses);

                await ctx.answerCbQuery('⚖️');
                await ctx.editMessageText(getText('drv_enter_weight', 'uz'), { parse_mode: 'HTML' });
                return;
            }

            // ── HISOB-KITOB TASDIQLASH ──────────────────────────────────
            if (data.startsWith('confirm_calc_')) {
                const reqId = parseInt(data.replace('confirm_calc_', ''));
                const ses = sessions.get(tgId);
                if (!ses || !ses.weight) return;

                const request = await prisma.recycleRequest.findUnique({
                    where: { id: reqId },
                    include: { point: true },
                });
                if (!request) return;

                const discount = ses.discount ?? 0;
                const pricePerKg = request.point?.pricePerKg || 800;
                const effectiveWeight = ses.weight * (1 - (discount / 100));
                const totalAmount = effectiveWeight * pricePerKg;

                // Yig'ish hisob-kitobini saqlash
                const collection = await prisma.recycleCollection.create({
                    data: {
                        requestId: reqId,
                        driverId: driver.id,
                        actualWeight: ses.weight,
                        discountPercent: discount,
                        effectiveWeight: Math.round(effectiveWeight * 100) / 100,
                        pricePerKg,
                        totalAmount: Math.round(totalAmount),
                        collectedAt: new Date(),
                    },
                });

                // Request statusini yangilash
                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: { status: 'collecting', collectedAt: new Date() },
                });

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(getText('drv_collection_saved', 'uz'), { parse_mode: 'HTML' });

                // Mijozga hisob-kitob tasdiqini yuborish
                if (request.customerTgId) {
                    const lang = (request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        request.customerTgId,
                        formatText('notif_calc_confirm', lang, {
                            weight: String(ses.weight),
                            discount: String(discount),
                            total: fmtN(Math.round(totalAmount)),
                        }),
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        btn('✅ Tasdiqlayman', `cust_confirm_${collection.id}`),
                                        btn('❌ Inkor qilaman', `cust_reject_${collection.id}`),
                                    ],
                                ],
                            },
                        }
                    );
                }

                sessions.delete(tgId);
                return;
            }

            // ── BEKOR QILISH ────────────────────────────────────────────
            if (data === 'calc_cancel') {
                sessions.delete(tgId);
                await ctx.answerCbQuery('❌');
                await ctx.editMessageText('❌ Bekor qilindi.');
                return;
            }

        } catch (err) {
            console.error('[DriverBot] Callback error:', err);
            await ctx.answerCbQuery('❌ Xatolik').catch(() => {});
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // TEXT HANDLER
    // ══════════════════════════════════════════════════════════════════════
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (text.startsWith('/')) return;

        const ses = sessions.get(tgId);

        // ── KOD BILAN RO'YXATDAN O'TISH ────────────────────────────────
        if (ses?.step === 'code' || !(await getDriver(tgId))) {
            const code = text.trim();
            if (!/^\d{5}$/.test(code)) {
                await ctx.reply('❌ 5 ta raqam kiriting! <i>Masalan: 48271</i>', { parse_mode: 'HTML' });
                return;
            }

            const driver = await prisma.driver.findFirst({ where: { registrationCode: code } });
            if (!driver) {
                await ctx.reply(`❌ <b>Kod topilmadi!</b>\n<code>${code}</code> — bazada yo'q.\n\n/start`, { parse_mode: 'HTML' });
                return;
            }
            if (driver.telegramId && driver.telegramId !== tgId) {
                await ctx.reply('❌ Bu kod boshqa foydalanuvchiga ulangan.');
                return;
            }

            await prisma.driver.update({
                where: { id: driver.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from.username || ctx.from.first_name || null,
                    registeredAt: new Date(),
                    isOnline: true,
                    lastSeenAt: new Date(),
                },
            });

            sessions.delete(tgId);
            await ctx.reply(
                formatText('drv_registered', 'uz', { name: driver.name }),
                { parse_mode: 'HTML', reply_markup: driverKeyboard('uz', true) }
            );
            return;
        }

        // Haydovchini tekshirish
        const driver = await getDriver(tgId);
        if (!driver) {
            await ctx.reply(getText('drv_not_registered', 'uz'), { parse_mode: 'HTML' });
            return;
        }

        // ── OG'IRLIK KIRITISH ──────────────────────────────────────────
        if (ses?.step === 'weight') {
            const weight = parseFloat(text.replace(',', '.'));
            if (isNaN(weight) || weight <= 0 || weight > 99999) {
                await ctx.reply('❌ Noto\'g\'ri og\'irlik! Musbat son kiriting.\n<i>Masalan: 45.5</i>', { parse_mode: 'HTML' });
                return;
            }
            ses.weight = weight;
            ses.step = 'discount';
            await ctx.reply(getText('drv_enter_discount', 'uz'), { parse_mode: 'HTML' });
            return;
        }

        // ── CHEGIRMA KIRITISH ──────────────────────────────────────────
        if (ses?.step === 'discount') {
            const discount = parseFloat(text.replace(',', '.'));
            if (isNaN(discount) || discount < 0 || discount > 100) {
                await ctx.reply('❌ 0-100 orasida raqam kiriting!');
                return;
            }

            const reqId = ses.activeRequestId!;
            const request = await prisma.recycleRequest.findUnique({
                where: { id: reqId },
                include: { point: true },
            });
            if (!request) {
                sessions.delete(tgId);
                await ctx.reply('❌ Ariza topilmadi.');
                return;
            }

            const pricePerKg = request.point?.pricePerKg || 800;
            const effectiveWeight = ses.weight! * (1 - (discount / 100));
            const totalAmount = effectiveWeight * pricePerKg;

            // Hisob-kitob natijasini ko'rsatish
            await ctx.reply(
                formatText('drv_calc_result', 'uz', {
                    weight: String(ses.weight),
                    discount: String(discount),
                    effective: String(Math.round(effectiveWeight * 100) / 100),
                    price: fmtN(pricePerKg),
                    total: fmtN(Math.round(totalAmount)),
                }),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [btn('✅ Tasdiqlash', `confirm_calc_${reqId}`)],
                            [btn('❌ Bekor qilish', 'calc_cancel')],
                        ],
                    },
                }
            );

            // Sessionga discount saqlash (confirm_calc da ishlatiladi)
            ses.discount = discount;
            return;
        }

        // ── MENYU TUGMALARI ────────────────────────────────────────────
        const lang: Lang = 'uz';

        // 📋 Topshiriqlar
        if (text === getText('drv_btn_tasks', lang) || text === getText('drv_btn_tasks', 'ru') || text === getText('drv_btn_tasks', 'en')) {
            const tasks = await prisma.recycleRequest.findMany({
                where: {
                    assignedDriverId: driver.id,
                    status: { in: ['assigned', 'en_route', 'arrived'] },
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
                    volume: volLabel,
                    photo: task.photoUrl ? 'Bor ✅' : 'Yo\'q',
                    time: new Date(task.createdAt).toLocaleString('ru-RU'),
                });

                const buttons: any[][] = [];
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
                }

                await ctx.reply(info, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: buttons },
                });
            }
            return;
        }

        // 🟢/🔴 Online/Offline
        if (text === getText('drv_btn_online', lang) || text === getText('drv_btn_online', 'ru') || text === getText('drv_btn_online', 'en')) {
            await prisma.driver.update({
                where: { id: driver.id },
                data: { isOnline: true, lastSeenAt: new Date(), status: 'active' },
            });
            await ctx.reply('🟢 Siz endi <b>online</b>siz!', {
                parse_mode: 'HTML',
                reply_markup: driverKeyboard(lang, true),
            });
            return;
        }

        if (text === getText('drv_btn_offline', lang) || text === getText('drv_btn_offline', 'ru') || text === getText('drv_btn_offline', 'en')) {
            await prisma.driver.update({
                where: { id: driver.id },
                data: { isOnline: false, lastSeenAt: new Date(), status: 'inactive' },
            });
            await ctx.reply('🔴 Siz endi <b>offline</b>siz.', {
                parse_mode: 'HTML',
                reply_markup: driverKeyboard(lang, false),
            });
            return;
        }

        // 📊 Kunlik hisobot
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
            const totalAmount = collections.reduce((s, c) => s + c.totalAmount, 0);

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

        // 👤 Profil
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

    driverBotInstance = bot;
    return bot;
}
