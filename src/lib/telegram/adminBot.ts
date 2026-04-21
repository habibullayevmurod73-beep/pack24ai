import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { Lang, getText, formatText } from './i18n';
import { notifyCustomer, notifyDriver } from './notifier';
import {
    btn,
    supervisorMainKeyboard,
    supervisorSharePhoneKeyboard,
    assignDriverKeyboard,
    paymentApproveKeyboard,
    pointToggleKeyboard,
    reportPeriodKeyboard,
    backKeyboard,
} from './keyboards';

// ─── Session types ────────────────────────────────────────────────────────────
interface AdminSession {
    step: 'phone' | 'menu';
    lang: Lang;
    supervisorId?: number;
}

const sessions = new Map<string, AdminSession>();
const fmtN = (n: number) => n.toLocaleString('ru-RU');

// ─── Yagona 5 raqamli kod generatsiya ────────────────────────────────────────
async function generateUniqueSupCode(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
        const code = String(Math.floor(10000 + Math.random() * 90000));
        const exists = await prisma.supervisor.findFirst({ where: { registrationCode: code } })
            || await prisma.driver.findFirst({ where: { registrationCode: code } });
        if (!exists) return code;
    }
    return String(Date.now()).slice(-5);
}

// ─── Masulni bazadan olish ────────────────────────────────────────────────────
async function getSupervisor(tgId: string) {
    return prisma.supervisor.findFirst({
        where: { telegramId: tgId },
        include: { point: true },
    });
}


// ─── Volume label ─────────────────────────────────────────────────────────────
function volLabel(size: string | null): string {
    return size === 'small' ? '📦 Kichik' : size === 'medium' ? '📦📦 O\'rta' : size === 'large' ? '📦📦📦 Katta' : '—';
}

// ─── Status label ─────────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
    new: '🔵 Yangi',
    dispatched: '📋 Yo\'naltirilgan',
    assigned: '🚚 Tayinlangan',
    en_route: '🚚 Yo\'lda',
    arrived: '📍 Yetib keldi',
    collecting: '⚖️ Tortilmoqda',
    completed: '✅ Yakunlangan',
    cancelled: '❌ Bekor',
};

// ─── Admin Bot init ───────────────────────────────────────────────────────────
let adminBotInstance: Telegraf | null = null;

export async function initAdminBot(): Promise<Telegraf | null> {
    if (adminBotInstance) return adminBotInstance;

    const token = process.env.ADMIN_BOT_TOKEN;
    if (!token) {
        console.warn('[AdminBot] ADMIN_BOT_TOKEN topilmadi');
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
        console.log(`[AdminBot] ${ctx.updateType} in ${Date.now() - start}ms`);
    });

    // ══════════════════════════════════════════════════════════════════════
    // /start — Telefon orqali ro'yxatdan o'tish yoki bosh menyu
    // ══════════════════════════════════════════════════════════════════════
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const sup = await getSupervisor(tgId);

        if (sup) {
            const lang: Lang = 'uz';
            await ctx.reply(
                formatText('adm_registered', lang, {
                    name: sup.name,
                    point: sup.point?.regionUz || '—',
                }),
                { parse_mode: 'HTML', reply_markup: supervisorMainKeyboard() }
            );
            return;
        }

        // Yangi foydalanuvchi — telefon so'rash
        sessions.set(tgId, { step: 'phone', lang: 'uz' });
        await ctx.reply(getText('adm_welcome', 'uz'), {
            parse_mode: 'HTML',
            reply_markup: supervisorSharePhoneKeyboard(),
        });
    });

    // ══════════════════════════════════════════════════════════════════════
    // /help
    // ══════════════════════════════════════════════════════════════════════
    bot.help(async (ctx) => {
        await ctx.reply(
            '👷 <b>Pack24 — Masul boti</b>\n\n' +
            '📋 Arizalar — yangi va jarayondagi arizalar\n' +
            '🚚 Haydovchi tayinlash — ariza uchun haydovchi tanlash\n' +
            '💰 To\'lovlar — hisob-kitob tasdiqlash\n' +
            '🏭 Punkt boshqarish — ochiq/yopiq almashtirish\n' +
            '📊 Hisobotlar — kunlik/haftalik/oylik statistika\n\n' +
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
            const sup = await getSupervisor(tgId);
            if (!sup) {
                await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagan');
                return;
            }

            // ── HAYDOVCHI TAYINLASH BOSHLASH ────────────────────────────
            if (data.startsWith('assign_driver_')) {
                const reqId = parseInt(data.replace('assign_driver_', ''));
                const request = await prisma.recycleRequest.findUnique({ where: { id: reqId } });
                if (!request) {
                    await ctx.answerCbQuery('❌ Ariza topilmadi');
                    return;
                }

                // Online haydovchilar ro'yxati
                const drivers = await prisma.driver.findMany({
                    where: {
                        isOnline: true,
                        status: { in: ['active'] },
                        ...(sup.pointId ? { pointId: sup.pointId } : {}),
                    },
                    orderBy: { lastSeenAt: 'desc' },
                    take: 10,
                });

                if (drivers.length === 0) {
                    await ctx.answerCbQuery('❌');
                    await ctx.editMessageText(getText('adm_no_drivers', 'uz'), { parse_mode: 'HTML' });
                    return;
                }

                await ctx.answerCbQuery('🚚');
                await ctx.editMessageText(
                    formatText('adm_select_driver', 'uz', { id: String(reqId) }),
                    {
                        parse_mode: 'HTML',
                        reply_markup: assignDriverKeyboard(drivers, reqId),
                    }
                );
                return;
            }

            // ── HAYDOVCHI TANLASH VA TAYINLASH ──────────────────────────
            if (data.startsWith('select_drv_')) {
                const parts = data.replace('select_drv_', '').split('_');
                const driverId = parseInt(parts[0]);
                const reqId = parseInt(parts[1]);

                const driver = await prisma.driver.findUnique({ where: { id: driverId } });
                const request = await prisma.recycleRequest.findUnique({
                    where: { id: reqId },
                    include: { point: true },
                });

                if (!driver || !request) {
                    await ctx.answerCbQuery('❌ Topilmadi');
                    return;
                }

                // Ariza va haydovchi yangilash
                await prisma.recycleRequest.update({
                    where: { id: reqId },
                    data: {
                        assignedDriverId: driverId,
                        assignedAt: new Date(),
                        status: 'assigned',
                        supervisorId: sup.id,
                        dispatchedAt: new Date(),
                    },
                });

                await prisma.driver.update({
                    where: { id: driverId },
                    data: { status: 'busy' },
                });

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    formatText('adm_driver_assigned', 'uz', {
                        id: String(reqId),
                        driver: driver.name,
                    }),
                    { parse_mode: 'HTML' }
                );

                // Haydovchiga xabar (Driver Bot orqali)
                if (driver.telegramId) {
                    const volText = volLabel(request.volumeSize);
                    const driverMsg =
                        `🆕 <b>Yangi topshiriq #${reqId}</b>\n\n` +
                        `👤 ${request.name}\n` +
                        `📞 ${request.phone}\n` +
                        `📍 ${request.point?.regionUz || '—'}\n` +
                        `⚖️ Hajm: ${volText}\n` +
                        `📸 Rasm: ${request.photoUrl ? 'Bor ✅' : 'Yo\'q'}\n` +
                        `🕐 ${new Date(request.createdAt).toLocaleString('ru-RU')}\n\n` +
                        `Qabul qilasizmi?`;
                    await notifyDriver(driver.telegramId, driverMsg, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    btn('✅ Qabul', `accept_${reqId}`),
                                    btn('❌ Rad', `reject_${reqId}`),
                                ],
                                [btn('🚚 Yo\'lga chiqdim', `enroute_${reqId}`)],
                            ],
                        },
                    });
                }

                // Mijozga xabar (Customer Bot orqali)
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

            // ── TO'LOVNI TASDIQLASH ─────────────────────────────────────
            if (data.startsWith('approve_payment_')) {
                const collId = parseInt(data.replace('approve_payment_', ''));
                const collection = await prisma.recycleCollection.findUnique({
                    where: { id: collId },
                    include: { request: true, driver: true },
                });

                if (!collection) {
                    await ctx.answerCbQuery('❌ Topilmadi');
                    return;
                }

                await prisma.recycleCollection.update({
                    where: { id: collId },
                    data: {
                        paymentStatus: 'completed',
                        paidAt: new Date(),
                        paidBy: sup.name,
                    },
                });

                // Ariza statusini yakunlash
                await prisma.recycleRequest.update({
                    where: { id: collection.requestId },
                    data: { status: 'completed', completedAt: new Date() },
                });

                // Haydovchini bo'shatish
                if (collection.driverId) {
                    await prisma.driver.update({
                        where: { id: collection.driverId },
                        data: { status: 'active' },
                    });
                }

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    formatText('adm_payment_approved', 'uz', { id: String(collId) }),
                    { parse_mode: 'HTML' }
                );

                // Mijozga yakuniy xabar
                if (collection.request.customerTgId) {
                    const lang = (collection.request.customerLang as Lang) || 'uz';
                    await notifyCustomer(
                        collection.request.customerTgId,
                        lang === 'uz'
                            ? `✅ <b>Ariza #${collection.requestId} yakunlandi!</b>\n\n💰 To'lov: ${fmtN(Math.round(collection.totalAmount))} so'm\n\nRahmat! ♻️`
                            : lang === 'ru'
                            ? `✅ <b>Заявка #${collection.requestId} завершена!</b>\n\n💰 Оплата: ${fmtN(Math.round(collection.totalAmount))} сум\n\nСпасибо! ♻️`
                            : `✅ <b>Request #${collection.requestId} completed!</b>\n\n💰 Payment: ${fmtN(Math.round(collection.totalAmount))} UZS\n\nThank you! ♻️`
                    );
                }
                return;
            }

            // ── PUNKT OCHIQ/YOPIQ ALMASHTIRISH ─────────────────────────
            if (data.startsWith('toggle_point_')) {
                const pointId = parseInt(data.replace('toggle_point_', ''));
                const point = await prisma.recyclePoint.findUnique({ where: { id: pointId } });
                if (!point) {
                    await ctx.answerCbQuery('❌');
                    return;
                }

                const newStatus = !point.isAccepting;
                await prisma.recyclePoint.update({
                    where: { id: pointId },
                    data: { isAccepting: newStatus },
                });

                const statusText = newStatus ? getText('point_open', 'uz') : getText('point_closed', 'uz');
                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    formatText('adm_point_toggled', 'uz', { status: statusText }),
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // ── HISOBOT DAVRLARI ────────────────────────────────────────
            if (data.startsWith('report_')) {
                const period = data.replace('report_', '');
                const now = new Date();
                const from = new Date();

                if (period === 'today') {
                    from.setHours(0, 0, 0, 0);
                } else if (period === 'week') {
                    from.setDate(from.getDate() - 7);
                } else if (period === 'month') {
                    from.setMonth(from.getMonth() - 1);
                }

                const pointFilter = sup.pointId ? { regionId: sup.pointId } : {};

                const totalRequests = await prisma.recycleRequest.count({
                    where: { ...pointFilter, createdAt: { gte: from } },
                });
                const completedRequests = await prisma.recycleRequest.count({
                    where: { ...pointFilter, status: 'completed', completedAt: { gte: from } },
                });
                const collections = await prisma.recycleCollection.findMany({
                    where: { createdAt: { gte: from } },
                });
                const totalWeight = collections.reduce((s, c) => s + c.actualWeight, 0);
                const totalAmount = collections.reduce((s, c) => s + c.totalAmount, 0);
                const activeDrivers = await prisma.driver.count({
                    where: {
                        isOnline: true,
                        ...(sup.pointId ? { pointId: sup.pointId } : {}),
                    },
                });

                const periodLabel = period === 'today' ? 'Bugun' : period === 'week' ? 'Hafta' : 'Oy';

                await ctx.answerCbQuery('📊');
                await ctx.editMessageText(
                    formatText('adm_report', 'uz', {
                        period: periodLabel,
                        requests: String(totalRequests),
                        completed: String(completedRequests),
                        weight: String(Math.round(totalWeight * 10) / 10),
                        amount: fmtN(Math.round(totalAmount)),
                        drivers: String(activeDrivers),
                    }),
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // ── HAYDOVCHI MA'LUMOTI ─────────────────────────────────────
            if (data.startsWith('driver_info_')) {
                const driverId = parseInt(data.replace('driver_info_', ''));
                const driver = await prisma.driver.findUnique({ where: { id: driverId } });
                if (!driver) {
                    await ctx.answerCbQuery('❌ Haydovchi topilmadi');
                    return;
                }

                const totalCollections = await prisma.recycleCollection.count({
                    where: { driverId: driver.id },
                });
                const totalWeightAgg = await prisma.recycleCollection.aggregate({
                    where: { driverId: driver.id },
                    _sum: { actualWeight: true },
                });

                await ctx.answerCbQuery('👤');
                await ctx.editMessageText(
                    `👤 <b>${driver.name}</b>\n\n` +
                    `📞 ${driver.phone}\n` +
                    `🚗 Mashina: ${driver.vehicleInfo || '—'}\n` +
                    `📊 Holat: ${driver.isOnline ? '🟢 Online' : '🔴 Offline'}\n` +
                    `🔄 Status: ${driver.status}\n\n` +
                    `📈 <b>Statistika:</b>\n` +
                    `🔢 Jami yig'ishlar: ${totalCollections}\n` +
                    `⚖️ Jami og'irlik: ${fmtN(Math.round((totalWeightAgg._sum.actualWeight || 0) * 10) / 10)} kg\n` +
                    `📅 Ro'yxatdan: ${driver.registeredAt ? new Date(driver.registeredAt).toLocaleDateString('ru-RU') : '—'}`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: backKeyboard(),
                    }
                );
                return;
            }

            // ── BEKOR ───────────────────────────────────────────────────
            if (data === 'adm_cancel') {
                await ctx.answerCbQuery('❌');
                await ctx.editMessageText('❌ Bekor qilindi.');
                return;
            }

        } catch (err) {
            console.error('[AdminBot] Callback error:', err);
            await ctx.answerCbQuery('❌ Xatolik').catch(() => {});
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // CONTACT HANDLER — Telefon raqami ulashilganda
    // ══════════════════════════════════════════════════════════════════════
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();

        if (ctx.message.contact.user_id && ctx.message.contact.user_id !== ctx.from.id) {
            await ctx.reply('❌ Iltimos, faqat o\'z telefon raqamingizni ulashing.', {
                reply_markup: supervisorSharePhoneKeyboard(),
            });
            return;
        }

        let phone = ctx.message.contact.phone_number.replace(/[^0-9+]/g, '');
        if (!phone.startsWith('+')) phone = '+' + phone;

        try {
            const supervisor = await prisma.supervisor.findFirst({
                where: {
                    OR: [
                        { phone },
                        { phone: phone.replace('+', '') },
                        { phone: phone.replace('+998', '0') },
                        { phone: phone.slice(-9) },
                    ],
                },
                include: { point: true },
            });

            if (!supervisor) {
                await ctx.reply(
                    `❌ <b>Raqamingiz tizimda topilmadi!</b>\n\n` +
                    `📱 Telefon: <code>${phone}</code>\n\n` +
                    `Bu bot faqat <b>ro'yxatdan o'tgan masul xodimlar</b> uchun.\n\n` +
                    `📋 Masul xodim bo'lish uchun:\n` +
                    `1️⃣ Pack24 bosh administratori sizni tizimga qo'shishi kerak\n` +
                    `2️⃣ Keyin qaytib kelib /start bosing\n\n` +
                    `👤 Oddiy foydalanuvchi sifatida ro'yxatdan o'tmoqchimisiz?\n` +
                    `▶️ <a href="https://t.me/Pack24AI_bot">@Pack24AI_bot</a> botiga o'ting\n\n` +
                    `📞 Bog'lanish: <a href="tel:+998880557888">+998 88 055-78-88</a>`,
                    { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }
                );
                sessions.delete(tgId);
                return;
            }

            if (supervisor.telegramId && supervisor.telegramId !== tgId) {
                await ctx.reply(getText('adm_already_registered', 'uz'), {
                    parse_mode: 'HTML',
                    reply_markup: { remove_keyboard: true },
                });
                return;
            }

            // Yangi 5-raqamli kod generatsiya
            const code = await generateUniqueSupCode();

            await prisma.supervisor.update({
                where: { id: supervisor.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from.username || ctx.from.first_name || null,
                    registeredAt: new Date(),
                    registrationCode: code,
                },
            });

            sessions.delete(tgId);

            // Masulga kod va menyu yuborish
            await ctx.reply(
                formatText('adm_code_sent', 'uz', {
                    name: supervisor.name,
                    point: supervisor.point?.regionUz || '—',
                    code,
                }),
                {
                    parse_mode: 'HTML',
                    reply_markup: supervisorMainKeyboard(),
                }
            );

            // Admin salesChatId ga xabar (agar sozlangan bo'lsa)
            try {
                const config = await prisma.telegramConfig.findFirst();
                if (config?.salesChatId) {
                    const adminBot_ = await import('./botManager').then(m => m.getAdminBot());
                    if (adminBot_) {
                        const chatIds = config.salesChatId.split(',').map(s => s.trim()).filter(Boolean);
                        for (const chatId of chatIds) {
                            await adminBot_.telegram.sendMessage(
                                chatId,
                                `🆕 <b>Masul shaxs ro'yxatdan o'tdi!</b>\n\n` +
                                `👤 ${supervisor.name}\n` +
                                `📞 ${supervisor.phone}\n` +
                                `🏭 Punkt: ${supervisor.point?.regionUz || '—'}\n` +
                                `🔑 Verifikatsion kod: <code>${code}</code>\n` +
                                `🕐 ${new Date().toLocaleString('ru-RU')}`,
                                { parse_mode: 'HTML' }
                            );
                        }
                    }
                }
            } catch { /* salesChatId yo'q — ok */ }

            console.log(`[AdminBot] ✅ Masul ro'yxatdan o'tdi: ${supervisor.name} | Kod: ${code}`);

        } catch (err) {
            console.error('[AdminBot] Contact handler xatolik:', err);
            await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', {
                reply_markup: { remove_keyboard: true },
            });
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

        // Ro'yxatdan o'tmagan foydalanuvchi — /start ga yo'naltirish
        const sup = await getSupervisor(tgId);
        if (!sup) {
            await ctx.reply(
                '❌ Siz masul sifatida ro\'yxatdan o\'tmagansiz.\n\n/start bosing va telefon raqamingizni ulashing.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        const lang: Lang = 'uz';

        // ── 📋 ARIZALAR ────────────────────────────────────────────────
        if (text === getText('adm_btn_requests', lang) || text === getText('adm_btn_requests', 'ru') || text === getText('adm_btn_requests', 'en')) {
            const pointFilter = sup.pointId ? { regionId: sup.pointId } : {};
            const requests = await prisma.recycleRequest.findMany({
                where: {
                    ...pointFilter,
                    status: { in: ['new', 'dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] },
                },
                include: { point: true, assignedDriver: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            if (requests.length === 0) {
                await ctx.reply(getText('adm_no_requests', lang));
                return;
            }

            for (const req of requests) {
                const info = formatText('adm_request_info', lang, {
                    id: String(req.id),
                    name: req.name,
                    phone: req.phone,
                    region: req.point?.regionUz || '—',
                    volume: volLabel(req.volumeSize),
                    photo: req.photoUrl ? 'Bor ✅' : 'Yo\'q',
                    time: new Date(req.createdAt).toLocaleString('ru-RU'),
                    status: statusLabels[req.status] || req.status,
                });

                const buttons: any[][] = [];

                if (req.status === 'new') {
                    buttons.push([btn('🚚 Haydovchi tayinlash', `assign_driver_${req.id}`)]);
                }
                if (req.assignedDriver) {
                    buttons.push([btn(`👤 ${req.assignedDriver.name}`, `driver_info_${req.assignedDriver.id}`)]);
                }

                // Lokatsiya tugmasi
                if (req.pickupLat && req.pickupLng && req.pickupLat !== 0) {
                    buttons.push([{ text: '📍 Lokatsiyani ko\'rish', url: `https://maps.google.com/maps?q=${req.pickupLat},${req.pickupLng}` }]);
                }

                await ctx.reply(info, {
                    parse_mode: 'HTML',
                    reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined,
                });
            }
            return;
        }

        // ── 👥 HAYDOVCHILAR ────────────────────────────────────────────
        if (text === getText('adm_btn_drivers', lang) || text === getText('adm_btn_drivers', 'ru') || text === getText('adm_btn_drivers', 'en')) {
            const pointFilter = sup.pointId ? { pointId: sup.pointId } : {};
            const drivers = await prisma.driver.findMany({
                where: { ...pointFilter },
                orderBy: [{ isOnline: 'desc' }, { lastSeenAt: 'desc' }],
            });

            if (drivers.length === 0) {
                await ctx.reply('👥 Haydovchilar ro\'yxati bo\'sh.');
                return;
            }

            let msg = '👥 <b>Haydovchilar:</b>\n\n';
            for (const d of drivers) {
                const onlineIcon = d.isOnline ? '🟢' : '🔴';
                const statusIcon = d.status === 'busy' ? '🚛' : d.status === 'on_route' ? '🚚' : '';
                const lastSeen = d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString('ru-RU') : '—';
                msg += `${onlineIcon} <b>${d.name}</b> ${statusIcon}\n`;
                msg += `   📞 ${d.phone} | 🚗 ${d.vehicleInfo || '—'}\n`;
                msg += `   🕐 Oxirgi: ${lastSeen}\n\n`;
            }

            await ctx.reply(msg, { parse_mode: 'HTML' });
            return;
        }

        // ── 💰 TO'LOVLAR ───────────────────────────────────────────────
        if (text === getText('adm_btn_payments', lang) || text === getText('adm_btn_payments', 'ru') || text === getText('adm_btn_payments', 'en')) {
            const collections = await prisma.recycleCollection.findMany({
                where: {
                    paymentStatus: { in: ['pending', 'paid_to_driver'] },
                },
                include: {
                    request: true,
                    driver: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            if (collections.length === 0) {
                await ctx.reply('💰 Kutilayotgan to\'lovlar yo\'q.');
                return;
            }

            for (const col of collections) {
                const info = formatText('adm_payment_info', lang, {
                    id: String(col.id),
                    customer: col.request.name,
                    driver: col.driver?.name || '—',
                    weight: String(col.actualWeight),
                    amount: fmtN(Math.round(col.totalAmount)),
                    status: col.paymentStatus === 'pending' ? '⏳ Kutilmoqda' : '💵 Haydovchiga to\'langan',
                });

                await ctx.reply(info, {
                    parse_mode: 'HTML',
                    reply_markup: paymentApproveKeyboard(col.id),
                });
            }
            return;
        }

        // ── 🏭 PUNKT BOSHQARISH ───────────────────────────────────────
        if (text === getText('adm_btn_point', lang) || text === getText('adm_btn_point', 'ru') || text === getText('adm_btn_point', 'en')) {
            if (!sup.point) {
                await ctx.reply('❌ Sizga punkt biriktirilmagan. Admin bilan bog\'laning.');
                return;
            }

            const point = sup.point;
            const statusText = point.isAccepting ? getText('point_open', lang) : getText('point_closed', lang);

            await ctx.reply(
                formatText('adm_point_status', lang, {
                    name: point.regionUz,
                    status: statusText,
                    hours: point.workingHours,
                }),
                { parse_mode: 'HTML', reply_markup: pointToggleKeyboard(point.id, point.isAccepting) }
            );
            return;
        }

        // ── 📊 HISOBOTLAR ──────────────────────────────────────────────
        if (text === getText('adm_btn_report', lang) || text === getText('adm_btn_report', 'ru') || text === getText('adm_btn_report', 'en')) {
            await ctx.reply(
                '📊 <b>Hisobot davrini tanlang:</b>',
                { parse_mode: 'HTML', reply_markup: reportPeriodKeyboard() }
            );
            return;
        }
    });

    adminBotInstance = bot;
    return bot;
}
