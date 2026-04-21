// ═══════════════════════════════════════════════════════════════════════════════
// Inline Callback Query handler — barcha rollar uchun
// assign, enroute, arrived, collecting, calc, pay, confirm, deny, force, complaint
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { MAT, btn, fmtN, getStatusLabel } from '../constants';
import { arizaSessions, complaintSessions, registrationSessions } from '../sessions';

export function registerCallbackHandler(bot: Telegraf) {
    bot.on('callback_query', async (ctx) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return;
        const tgId = ctx.from.id.toString();

        try {
            // ── ARIZA SESSION CALLBACKS ───────────────────────────────────
            if (data === 'ariza_usename') {
                const ses = arizaSessions.get(tgId);
                if (ses?.step === 'name' && ses.name) {
                    ses.step = 'phone';
                    await ctx.answerCbQuery('✅');
                    await ctx.editMessageText(
                        `👤 Ism: <b>${ses.name}</b>\n\n📱 Telefon raqamingizni kiriting:\n<i>Masalan: 998901234567</i>`,
                        { parse_mode: 'HTML' }
                    );
                    return;
                }
            }

            if (data === 'ariza_cancel') {
                arizaSessions.delete(tgId);
                await ctx.answerCbQuery('❌ Bekor qilindi');
                await ctx.editMessageText('❌ Ariza bekor qilindi.\n\nYangi ariza uchun /ariza yuboring.');
                return;
            }

            // ── RO'YXATDAN O'TISH (KOD BILAN) ───────────────────────────
            if (data === 'register_code') {
                registrationSessions.add(tgId);
                await ctx.answerCbQuery('🔑');
                await ctx.editMessageText(
                    `🔑 <b>Kod bilan ro'yxatdan o'tish</b>\n\n` +
                    `Admin sizga bergan <b>5 raqamli kodni</b> kiriting:\n\n` +
                    `<i>Masalan: 48271</i>`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('❌ Bekor qilish', 'register_cancel')],
                            ],
                        },
                    }
                );
                return;
            }

            if (data === 'register_cancel') {
                registrationSessions.delete(tgId);
                await ctx.answerCbQuery('❌ Bekor qilindi');
                await ctx.editMessageText('❌ Bekor qilindi.\n\n/start — Bosh menyuga qaytish');
                return;
            }

            // ── Ariza: Hudud tanlash ─────────────────────────────────────
            if (data.startsWith('ariza_region_')) {
                const regionId = parseInt(data.split('_')[2]);
                const ses = arizaSessions.get(tgId);
                if (ses?.step === 'region') {
                    ses.regionId = regionId;
                    ses.step = 'material';
                    const matButtons = Object.entries(MAT).map(([key, m]) =>
                        [btn(`${m.emoji} ${m.label}`, `ariza_mat_${key}`)]
                    );
                    await ctx.answerCbQuery('✅');
                    await ctx.editMessageText(
                        `📦 <b>Material turini tanlang:</b>`,
                        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [...matButtons, [btn('❌ Bekor', 'ariza_cancel')]] } }
                    );
                    return;
                }
            }

            // ── Ariza: Material tanlash ──────────────────────────────────
            if (data.startsWith('ariza_mat_')) {
                const matKey = data.replace('ariza_mat_', '');
                const ses = arizaSessions.get(tgId);
                if (ses?.step === 'material') {
                    ses.material = matKey;
                    ses.step = 'volume';
                    await ctx.answerCbQuery('✅');
                    await ctx.editMessageText(
                        `⚖️ <b>Taxminiy og'irlik (kg):</b>\n\n<i>Masalan: 100</i>\nBilmasangiz 0 yozing.`,
                        { parse_mode: 'HTML' }
                    );
                    return;
                }
            }

            // ── Ariza: Pickup / Base tanlash ─────────────────────────────
            if (data === 'ariza_pickup') {
                const ses = arizaSessions.get(tgId);
                if (ses?.step === 'address') {
                    ses.step = 'confirm';
                    await ctx.answerCbQuery('✅');
                    await ctx.editMessageText(
                        `🏠 <b>Manzilingizni kiriting:</b>\n\n<i>Masalan: Toshkent sh., Chilonzor-7, 3-uy</i>`,
                        { parse_mode: 'HTML' }
                    );
                    return;
                }
            }

            if (data === 'ariza_base') {
                const ses = arizaSessions.get(tgId);
                if (ses?.step === 'address') {
                    await ctx.answerCbQuery('✅');
                    // Dynamic import to avoid circular dependency
                    const { createArizaFromSession } = await import('./arizaHandler');
                    await createArizaFromSession(ctx, tgId, 'base', null, bot);
                    return;
                }
            }

            // ── Masul: Haydovchi tayinlash ──────────────────────────────────
            if (data.startsWith('assign_')) {
                const parts = data.split('_');
                const requestId = parseInt(parts[1]);
                const driverId = parseInt(parts[2]);

                const driver = await prisma.driver.findUnique({ where: { id: driverId } });
                if (!driver) { await ctx.answerCbQuery('Haydovchi topilmadi'); return; }

                await prisma.recycleRequest.update({
                    where: { id: requestId },
                    data: { assignedDriverId: driverId, status: 'assigned', assignedAt: new Date() },
                });
                await prisma.driver.update({ where: { id: driverId }, data: { status: 'busy' } });

                await ctx.answerCbQuery('✅ Tayinlandi!');
                await ctx.editMessageText(`✅ Ariza #${requestId} → <b>${driver.name}</b> ga tayinlandi!`, { parse_mode: 'HTML' });

                // Haydovchiga xabar
                if (driver.telegramId) {
                    const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { point: true } });
                    await bot.telegram.sendMessage(driver.telegramId,
                        `🚚 <b>Yangi ish tayinlandi! #${requestId}</b>\n\n` +
                        `👤 ${req?.name} | 📞 ${req?.phone}\n` +
                        `📍 ${req?.point?.regionUz || '—'}\n` +
                        `${req?.address ? `🏠 ${req.address}\n` : ''}` +
                        `📦 ${req?.material || '—'} | ⚖️ ${req?.volume ? req.volume + ' kg' : '—'}`,
                        {
                            parse_mode: 'HTML',
                            reply_markup: { inline_keyboard: [[btn('✅ Qabul — yo\'lga chiqaman', `enroute_${requestId}`)], [btn('❌ Rad etish', `reject_${requestId}`)]] },
                        }
                    );
                }

                // Mijozga xabar
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId } });
                if (req?.customerTgId) {
                    await bot.telegram.sendMessage(req.customerTgId,
                        `✅ <b>Ariza #${requestId} qabul qilindi!</b>\n\nHaydovchi: <b>${driver.name}</b>\nTez orada siz bilan bog'laniladi!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Haydovchi: Yo'lga chiqish ───────────────────────────────────
            if (data.startsWith('enroute_')) {
                const requestId = parseInt(data.split('_')[1]);
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'en_route', driverEnRouteAt: new Date() } });
                const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
                if (driver) await prisma.driver.update({ where: { id: driver.id }, data: { status: 'on_route' } });

                await ctx.answerCbQuery('🚚 Yo\'lga chiqdingiz!');
                await ctx.editMessageText(`🚚 <b>Ariza #${requestId}</b> — Yo'lga chiqdingiz!\n\nYetib borganingizda 📍 tugmasini bosing.`,
                    { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[btn('📍 Yetib keldim', `arrived_${requestId}`)]] } }
                );

                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId } });
                if (req?.customerTgId) {
                    await bot.telegram.sendMessage(req.customerTgId,
                        `🚚 <b>Haydovchi yo'lga chiqdi!</b>\n\nAriza #${requestId}\nHaydovchi: ${driver?.name || '—'}\n\nTez orada yetib boradi!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Haydovchi: Yetib keldi ──────────────────────────────────────
            if (data.startsWith('arrived_')) {
                const requestId = parseInt(data.split('_')[1]);
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'arrived', driverArrivedAt: new Date() } });

                await ctx.answerCbQuery('📍 Yetib keldingiz!');
                await ctx.editMessageText(
                    `📍 <b>Ariza #${requestId}</b> — Yetib keldingiz!\n\nMijoz: tugmasini bosib yuk yig'ishni boshlang.`,
                    { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[btn('📦 Yig\'ishni boshlash', `collecting_${requestId}`)]] } }
                );

                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId } });
                if (req?.customerTgId) {
                    await bot.telegram.sendMessage(req.customerTgId,
                        `📍 <b>Haydovchi yetib keldi!</b>\n\nAriza #${requestId}\nIltimos, chiqing — haydovchi kutmoqda!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Haydovchi: Yig'ishni boshlash ───────────────────────────────
            if (data.startsWith('collecting_')) {
                const requestId = parseInt(data.split('_')[1]);
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'collecting' } });

                await ctx.answerCbQuery('📦 Yig\'ish boshlandi!');
                await ctx.editMessageText(
                    `📦 <b>Ariza #${requestId}</b> — Yig'ish boshlandi!\n\n` +
                    `Yig'ib bo'lgach ⚖️ kalkulator tugmasini bosing va og'irlik kiriting.`,
                    { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[btn('⚖️ Kalkulator — og\'irlik kiritish', `calc_${requestId}`)]] } }
                );
            }

            // ── Haydovchi: Kalkulator ───────────────────────────────────────
            if (data.startsWith('calc_')) {
                const requestId = parseInt(data.split('_')[1]);
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { point: true } });
                const price = req?.point?.pricePerKg || 800;

                await ctx.answerCbQuery('⚖️ Kalkulator');
                await ctx.editMessageText(
                    `⚖️ <b>Kalkulator — Ariza #${requestId}</b>\n\n` +
                    `Narx: <b>${price.toLocaleString('ru-RU')} so'm/kg</b>\n\n` +
                    `Og'irlikni yozing (kg formatida):\n<i>Masalan: 150</i>\n\n` +
                    `📝 Keyingi xabaringizda faqat raqam yozing!`,
                    { parse_mode: 'HTML' }
                );

                await prisma.driver.update({
                    where: { telegramId: tgId },
                    data: { vehicleInfo: `CALC_${requestId}` },
                });
            }

            // ── Haydovchi: Rad etish ────────────────────────────────────────
            if (data.startsWith('reject_')) {
                const requestId = parseInt(data.split('_')[1]);
                const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { assignedDriverId: null, status: 'dispatched', assignedAt: null } });
                if (driver) await prisma.driver.update({ where: { id: driver.id }, data: { status: 'active' } });

                await ctx.answerCbQuery('❌ Rad etildi');
                await ctx.editMessageText(`❌ Ariza #${requestId} rad etildi.\n\nMasulga qayta tayinlash uchun xabar yuborildi.`, { parse_mode: 'HTML' });

                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { supervisor: true } });
                if (req?.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `❌ <b>Haydovchi rad etdi!</b>\n\nAriza #${requestId}\nHaydovchi: ${driver?.name}\n\nIltimos, boshqa haydovchi tayinlang!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Mijoz: Tasdiqlash ───────────────────────────────────────────
            if (data.startsWith('confirm_')) {
                const collectionId = parseInt(data.split('_')[1]);
                await prisma.recycleCollection.update({ where: { id: collectionId }, data: { customerConfirmed: true } });
                const coll = await prisma.recycleCollection.findUnique({
                    where: { id: collectionId },
                    include: { request: { include: { supervisor: true } }, driver: true },
                });
                if (coll) {
                    await prisma.recycleRequest.update({ where: { id: coll.requestId }, data: { status: 'confirmed', confirmedAt: new Date() } });

                    await ctx.answerCbQuery('✅ Tasdiqlandi!');
                    await ctx.editMessageText(
                        `✅ <b>Tasdiqlandi!</b>\n\n` +
                        `📋 Ariza #${coll.requestId}\n` +
                        `💵 Summa: <b>${fmtN(coll.totalAmount)} so'm</b>\n\n` +
                        `Rahmat! To'lov tez orada amalga oshiriladi. ♻️`,
                        { parse_mode: 'HTML' }
                    );

                    // Mas'ulga to'lov tugmalari
                    if (coll.request.supervisor?.telegramId) {
                        const matInfo = MAT[coll.materialType || 'mix'] || MAT.mix;
                        await bot.telegram.sendMessage(coll.request.supervisor.telegramId,
                            `✅ <b>Mijoz tasdiqladi! Ariza #${coll.requestId}</b>\n\n` +
                            `${matInfo.emoji} ${matInfo.label}\n` +
                            `⚖️ ${coll.actualWeight} kg${coll.discountPercent > 0 ? ` → ${coll.effectiveWeight.toFixed(1)} kg (-${coll.discountPercent}%)` : ''}\n` +
                            `💵 <b>${fmtN(coll.totalAmount)} so'm</b>\n` +
                            `🚚 Haydovchi: ${coll.driver.name}\n` +
                            `👤 Mijoz: ${coll.request.name} | ${coll.request.phone}\n\n` +
                            `💰 <b>To'lovni amalga oshiring:</b>`,
                            {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [btn(`💵 Mijozga to'lash (${fmtN(coll.totalAmount)} so'm)`, `pay_cust_${coll.id}`)],
                                        [btn(`🚚 Haydovchiga to'lash (${fmtN(Math.round(coll.totalAmount * 0.1))} so'm)`, `pay_drv_${coll.id}`)],
                                        [btn(`💰 Ikkalasiga to'lash`, `pay_both_${coll.id}`)],
                                    ],
                                },
                            }
                        );
                    }

                    if (coll.driver.telegramId) {
                        await bot.telegram.sendMessage(coll.driver.telegramId,
                            `✅ <b>Mijoz tasdiqladi!</b>\n\n📋 Ariza #${coll.requestId}\n💵 ${fmtN(coll.totalAmount)} so'm\n\nTo'lov mas'ul tomonidan amalga oshiriladi.`,
                            { parse_mode: 'HTML' }
                        );
                    }
                } else {
                    await ctx.answerCbQuery('✅ Tasdiqlandi!');
                    await ctx.editMessageText(`✅ <b>Tasdiqlandi!</b>\n\nRahmat! ♻️`, { parse_mode: 'HTML' });
                }
            }

            // ── Mijoz: Inkor ────────────────────────────────────────────────
            if (data.startsWith('deny_')) {
                const collectionId = parseInt(data.split('_')[1]);
                await prisma.recycleCollection.update({ where: { id: collectionId }, data: { customerConfirmed: false } });
                const coll = await prisma.recycleCollection.findUnique({
                    where: { id: collectionId },
                    include: { request: { include: { supervisor: true } }, driver: true },
                });
                if (coll) {
                    await prisma.recycleRequest.update({ where: { id: coll.requestId }, data: { status: 'disputed' } });

                    await ctx.answerCbQuery('❌ Inkor qilindi');
                    await ctx.editMessageText(
                        `❌ <b>Inkor qilindi!</b>\n\n` +
                        `📋 Ariza #${coll.requestId}\n\n` +
                        `Ma'lumotlar noto'g'ri deb belgilandi.\n` +
                        `Mas'ul shaxs siz bilan bog'lanadi.\n\n` +
                        `Shikoyat uchun /shikoyat buyrug'ini yuboring.`,
                        { parse_mode: 'HTML' }
                    );

                    if (coll.request.supervisor?.telegramId) {
                        await bot.telegram.sendMessage(coll.request.supervisor.telegramId,
                            `⚠️ <b>Mijoz INKOR qildi! Ariza #${coll.requestId}</b>\n\n` +
                            `👤 Mijoz: ${coll.request.name} | ${coll.request.phone}\n` +
                            `🚚 Haydovchi: ${coll.driver.name}\n` +
                            `⚖️ ${coll.actualWeight} kg → ${fmtN(coll.totalAmount)} so'm\n\n` +
                            `❗ Mijoz ma'lumotlarni noto'g'ri deb belgiladi.\nIltimos, mijoz bilan bog'lanib muammoni hal qiling.`,
                            { parse_mode: 'HTML' }
                        );
                    }

                    if (coll.driver.telegramId) {
                        await bot.telegram.sendMessage(coll.driver.telegramId,
                            `⚠️ <b>Mijoz inkor qildi!</b>\n\n📋 Ariza #${coll.requestId}\n❗ Mijoz ma'lumotlarni noto'g'ri deb belgiladi.\nMas'ul siz bilan bog'lanadi.`,
                            { parse_mode: 'HTML' }
                        );
                    }
                } else {
                    await ctx.answerCbQuery('❌ Inkor qilindi');
                    await ctx.editMessageText(`❌ <b>Inkor qilindi!</b>\n\nMas'ul siz bilan bog'lanadi.`, { parse_mode: 'HTML' });
                }
            }

            // ── Shikoyat: Ariza tanlash ──────────────────────────────────
            if (data.startsWith('complaint_')) {
                if (data === 'complaint_cancel') {
                    complaintSessions.delete(ctx.from!.id.toString());
                    await ctx.answerCbQuery('❌ Bekor qilindi');
                    await ctx.editMessageText('❌ Shikoyat bekor qilindi.');
                    return;
                }
                const reqId = parseInt(data.replace('complaint_', ''));
                if (isNaN(reqId)) { await ctx.answerCbQuery('Xatolik'); return; }

                await ctx.answerCbQuery('✅ Ariza tanlandi');
                await ctx.editMessageText(
                    `⚠️ <b>Shikoyat darajasini tanlang:</b>\n\n📋 Ariza: <b>#${reqId}</b>`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: [
                            [btn('👷 Masul shaxsga', `complaint_level_supervisor_${reqId}`)],
                            [btn('🏢 Direktorsiyaga', `complaint_level_director_${reqId}`)],
                            [btn('❌ Bekor qilish', 'complaint_cancel')],
                        ] },
                    }
                );
                return;
            }

            if (data.startsWith('complaint_level_')) {
                const parts = data.split('_');
                const level = parts[2] as 'supervisor' | 'director';
                const reqId = parseInt(parts[3]);
                if (isNaN(reqId)) { await ctx.answerCbQuery('Xatolik'); return; }

                complaintSessions.set(ctx.from!.id.toString(), { requestId: reqId, level });
                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    `📝 <b>Shikoyat matnini yozing:</b>\n\n` +
                    `📋 Ariza: #${reqId}\n` +
                    `📍 ${level === 'director' ? '🏢 Direktorsiyaga' : '👷 Masul shaxsga'} yo'naltiriladi.\n\n` +
                    `<i>Shikoyatingizni yozing va yuboring:</i>`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // ── Buyurtmalarim ────────────────────────────────────────────
            if (data === 'my_orders') {
                const myOrders = await prisma.order.findMany({
                    where: { telegramUserId: ctx.from!.id.toString() },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { id: true, totalAmount: true, status: true, createdAt: true },
                });
                if (myOrders.length === 0) {
                    await ctx.answerCbQuery('Buyurtma yo\'q');
                    await ctx.editMessageText('📦 Sizda hali buyurtma yo\'q.');
                    return;
                }
                const statusMap: Record<string, string> = {
                    new: '🔵', processing: '🟡', shipping: '🚚', delivered: '✅', cancelled: '🔴', draft: '⚪',
                };
                const list = myOrders.map(o =>
                    `${statusMap[o.status] || '⚪'} <b>#${o.id}</b> — ${fmtN(o.totalAmount || 0)} so'm — ${new Date(o.createdAt).toLocaleDateString('ru-RU')}`
                ).join('\n');
                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    `📦 <b>So'nggi buyurtmalaringiz:</b>\n\n${list}\n\nBatafsil: /buyurtma [raqam]`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // ── Masul: Arizani ko'rish + haydovchi tayinlash ──────────────
            if (data.startsWith('view_req_')) {
                const requestId = parseInt(data.split('_')[2]);
                const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
                if (!sup) { await ctx.answerCbQuery('❌ Ruxsat yo\'q'); return; }

                const req = await prisma.recycleRequest.findUnique({
                    where: { id: requestId },
                    include: { point: true, assignedDriver: true },
                });
                if (!req) { await ctx.answerCbQuery('Topilmadi'); return; }

                const drivers = await prisma.driver.findMany({
                    where: { supervisorId: sup.id, status: 'active' },
                    orderBy: [{ isOnline: 'desc' }, { id: 'asc' }],
                    take: 8,
                });

                const pickupLabel = req.pickupType === 'pickup' ? '🚛 Kuryer chiqishi' : '🏭 O\'zi olib keladi';
                const info =
                    `📋 <b>Ariza #${req.id}</b> — ${getStatusLabel(req.status)}\n\n` +
                    `👤 ${req.name} | 📞 ${req.phone}\n` +
                    `📍 ${req.point?.regionUz || '—'}\n` +
                    `🚚 Usul: ${pickupLabel}\n` +
                    `${req.address ? `🏠 ${req.address}\n` : ''}` +
                    `📦 ${req.material || '—'} | ⚖️ ${req.volume ? req.volume + ' kg' : '—'}\n\n` +
                    (drivers.length > 0
                        ? `👷 Haydovchi tanlang:`
                        : `⚠️ Hududingizda faol haydovchi yo'q!\nAdmin bilan bog'laning.`);

                const keyboard = drivers.length > 0
                    ? [
                        ...drivers.map(d => [{
                            text: `${d.isOnline ? '🟢' : '⚫'} ${d.name}`,
                            callback_data: `assign_${req.id}_${d.id}`,
                        }]),
                        [{ text: '🔄 Yangilash', callback_data: `view_req_${req.id}` }],
                    ]
                    : [[{ text: '🔄 Qayta tekshirish', callback_data: `view_req_${req.id}` }]];

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(info, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: keyboard },
                });
                return;
            }

            // ── Material tanlash (haydovchi kalkulator) ─────────────────
            if (data.startsWith('mat_')) {
                const [, materialType, rIdStr] = data.split('_');
                const requestId = parseInt(rIdStr);
                const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
                if (!driver?.vehicleInfo?.startsWith(`MATERIAL_${requestId}_`)) {
                    await ctx.answerCbQuery('Sessiya tugagan'); return;
                }
                const vp = driver.vehicleInfo.split('_');
                const weight = parseFloat(vp[2]);
                const discount = parseFloat(vp[3]);
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { point: true, supervisor: true } });
                if (!req) { await ctx.answerCbQuery('Ariza topilmadi'); return; }

                const matInfo = MAT[materialType] || MAT.mix;
                const basePrice = req.point?.pricePerKg || matInfo.price;
                const isPickup = req.pickupType === 'pickup';
                const finalPrice = isPickup ? basePrice * 0.5 : basePrice;

                const effectiveWeight = weight - (weight * discount / 100);
                const totalAmount = Math.round(effectiveWeight * finalPrice);
                const fullAmount = Math.round(effectiveWeight * basePrice);

                const collection = await prisma.recycleCollection.create({
                    data: { requestId, driverId: driver.id, actualWeight: weight, discountPercent: discount, effectiveWeight, pricePerKg: finalPrice, totalAmount, materialType, collectedAt: new Date() },
                });
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'collected', collectedAt: new Date() } });
                await prisma.driver.update({ where: { id: driver.id }, data: { vehicleInfo: null, status: 'active' } });

                // Haydovchiga natija
                await ctx.answerCbQuery('✅ Yig\'ish yakunlandi!');
                await ctx.editMessageText(
                    `✅ <b>Yig'ish yakunlandi! #${requestId}</b>\n\n` +
                    `${matInfo.emoji} ${matInfo.label}\n` +
                    `⚖️ Og'irlik: ${weight} kg\n` +
                    `${discount > 0 ? `🏷️ Chegirma: ${discount}% (sifat/namlik) → ${effectiveWeight.toFixed(1)} kg\n` : ''}` +
                    `💰 Narx: ${fmtN(basePrice)} so'm/kg\n` +
                    `${isPickup ? `🚚 Mashina xizmati: -50% → ${fmtN(finalPrice)} so'm/kg\n` : ''}` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `💵 <b>Jami: ${fmtN(totalAmount)} so'm</b>\n\n` +
                    `⏳ Mijoz tasdiqlashini kuting...\n` +
                    `<i>Agar mijoz tasdiqlay olmasa, pastdagi tugmani bosing.</i>`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('🔄 Qo\'lda yakunlash (mijoz tasdiqlamasa)', `force_${collection.id}`)],
                            ],
                        },
                    }
                );

                // Mijozga batafsil hisob-kitob
                if (req.customerTgId) {
                    let customerMsg =
                        `📊 <b>Makulatura hisob-kitobi — Ariza #${requestId}</b>\n\n` +
                        `${matInfo.emoji} Material: <b>${matInfo.label}</b>\n` +
                        `⚖️ Tortilgan og'irlik: <b>${weight} kg</b>\n`;

                    if (discount > 0) {
                        customerMsg +=
                            `\n🏷️ <b>Sifat chegirmasi: ${discount}%</b>\n` +
                            `   <i>(Sabab: namlik, ifloslik yoki sifat pastligi)</i>\n` +
                            `   ${weight} kg × ${discount}% = -${(weight * discount / 100).toFixed(1)} kg\n` +
                            `   📊 Hisoblangan og'irlik: <b>${effectiveWeight.toFixed(1)} kg</b>\n`;
                    }

                    customerMsg += `\n💰 Bazaviy narx: <b>${fmtN(basePrice)} so'm/kg</b>\n`;

                    if (isPickup) {
                        customerMsg +=
                            `\n🚚 <b>Mashina xizmati uchun komisssiya: -50%</b>\n` +
                            `   <i>Siz mashina chaqirgansiz, shuning uchun narxdan 50% ushlab qolinadi.</i>\n` +
                            `   ${fmtN(basePrice)} → <b>${fmtN(finalPrice)} so'm/kg</b>\n`;
                    }

                    customerMsg +=
                        `\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `💵 <b>Sizga to'lanadigan summa: ${fmtN(totalAmount)} so'm</b>\n`;

                    if (isPickup && discount > 0) {
                        customerMsg +=
                            `\n📋 <i>Hisob: ${effectiveWeight.toFixed(1)} kg × ${fmtN(finalPrice)} = ${fmtN(totalAmount)} so'm</i>\n` +
                            `<i>(Agar o'zingiz olib kelsangiz: ${fmtN(fullAmount)} so'm bo'lardi)</i>\n`;
                    } else if (isPickup) {
                        customerMsg +=
                            `\n📋 <i>Hisob: ${weight} kg × ${fmtN(finalPrice)} = ${fmtN(totalAmount)} so'm</i>\n` +
                            `<i>(Agar o'zingiz olib kelsangiz: ${fmtN(fullAmount)} so'm bo'lardi)</i>\n`;
                    }

                    customerMsg +=
                        `\n⚠️ <b>Iltimos, ma'lumotlarni tekshiring va tasdiqlang!</b>\n` +
                        `<i>Tasdiqlangandan keyingina to'lov amalga oshiriladi.</i>`;

                    await bot.telegram.sendMessage(req.customerTgId, customerMsg, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('✅ Tasdiqlash — to\'g\'ri', `confirm_${collection.id}`)],
                                [btn('❌ Inkor qilish — noto\'g\'ri', `deny_${collection.id}`)],
                            ],
                        },
                    });
                }

                // Masulga xabar
                if (req.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `📦 <b>Ariza #${requestId} — yig'ildi</b>\n\n` +
                        `${matInfo.emoji} ${matInfo.label}\n` +
                        `⚖️ ${weight} kg${discount > 0 ? ` → ${effectiveWeight.toFixed(1)} kg (-${discount}%)` : ''}\n` +
                        `${isPickup ? `🚚 Mashina: -50% → ${fmtN(finalPrice)} so'm/kg\n` : `💰 ${fmtN(basePrice)} so'm/kg\n`}` +
                        `💵 <b>${fmtN(totalAmount)} so'm</b>\n` +
                        `🚚 Haydovchi: ${driver.name}\n` +
                        `👤 Mijoz: ${req.name} | ${req.phone}\n\n` +
                        `⏳ <b>Mijoz tasdiqlashini kutmoqda...</b>\n` +
                        `<i>Tasdiqlangandan keyin to'lov tugmalari paydo bo'ladi.</i>`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Haydovchi: Qo'lda yakunlash ─────────────────────────────
            if (data.startsWith('force_') && !data.startsWith('force_yes_') && !data.startsWith('force_skip_') && !data.startsWith('force_back_')) {
                const collectionId = parseInt(data.replace('force_', ''));
                const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
                if (!driver) { await ctx.answerCbQuery('❌ Ruxsat yo\'q'); return; }
                const coll = await prisma.recycleCollection.findUnique({ where: { id: collectionId }, include: { request: true } });
                if (!coll) { await ctx.answerCbQuery('Topilmadi'); return; }
                if (coll.driverId !== driver.id) { await ctx.answerCbQuery('❌ Bu sizning ishingiz emas'); return; }

                await ctx.answerCbQuery('⚠️');
                await ctx.editMessageText(
                    `⚠️ <b>Qo'lda yakunlash — Ariza #${coll.requestId}</b>\n\n` +
                    `Mijozni habarnoma tasdiqlashi haqida ogohlantirdingizmi?\n\n` +
                    `<i>Mijozga yig'ish natijasi va to'lov summasi haqida aytganmisiz?</i>`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('✅ Ha, ogohlantirdim', `force_yes_${collectionId}`)],
                                [btn('⏭ O\'tkazib yuborish', `force_skip_${collectionId}`)],
                                [btn('🔙 Orqaga', `force_back_${collectionId}`)],
                            ],
                        },
                    }
                );
            }

            // ── Haydovchi: Qo'lda tasdiqlash ────────────────────────────
            if (data.startsWith('force_yes_') || data.startsWith('force_skip_')) {
                const isNotified = data.startsWith('force_yes_');
                const collectionId = parseInt(data.split('_')[2]);
                const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
                if (!driver) { await ctx.answerCbQuery('❌ Ruxsat yo\'q'); return; }
                const coll = await prisma.recycleCollection.findUnique({
                    where: { id: collectionId },
                    include: { request: { include: { supervisor: true } }, driver: true },
                });
                if (!coll) { await ctx.answerCbQuery('Topilmadi'); return; }
                if (coll.driverId !== driver.id) { await ctx.answerCbQuery('❌ Bu sizning ishingiz emas'); return; }

                await prisma.recycleCollection.update({
                    where: { id: collectionId },
                    data: { customerConfirmed: true, customerComment: isNotified ? 'Haydovchi ogohlantirdi (qo\'lda)' : 'Qo\'lda yakunlandi (o\'tkazib yuborildi)' },
                });
                await prisma.recycleRequest.update({
                    where: { id: coll.requestId },
                    data: { status: 'confirmed', confirmedAt: new Date() },
                });

                const notifyLabel = isNotified ? '✅ Mijoz ogohlantirilgan' : '⏭ O\'tkazib yuborilgan';
                await ctx.answerCbQuery('✅ Qabul qilindi!');
                await ctx.editMessageText(
                    `✅ <b>Qo'lda yakunlandi! #${coll.requestId}</b>\n\n${notifyLabel}\n💵 <b>${fmtN(coll.totalAmount)} so'm</b>\n\nMas'ulga to'lov tugmalari yuborildi.`,
                    { parse_mode: 'HTML' }
                );

                if (coll.request.supervisor?.telegramId) {
                    const matInfo = MAT[coll.materialType || 'mix'] || MAT.mix;
                    await bot.telegram.sendMessage(coll.request.supervisor.telegramId,
                        `🔄 <b>Haydovchi qo'lda yakunladi — Ariza #${coll.requestId}</b>\n\n` +
                        `${notifyLabel}\n${matInfo.emoji} ${matInfo.label}\n` +
                        `⚖️ ${coll.actualWeight} kg${coll.discountPercent > 0 ? ` → ${coll.effectiveWeight.toFixed(1)} kg (-${coll.discountPercent}%)` : ''}\n` +
                        `💵 <b>${fmtN(coll.totalAmount)} so'm</b>\n` +
                        `🚚 Haydovchi: ${coll.driver.name}\n👤 Mijoz: ${coll.request.name} | ${coll.request.phone}\n\n💰 <b>To'lovni amalga oshiring:</b>`,
                        {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [btn(`💵 Mijozga to'lash (${fmtN(coll.totalAmount)} so'm)`, `pay_cust_${coll.id}`)],
                                    [btn(`🚚 Haydovchiga to'lash (${fmtN(Math.round(coll.totalAmount * 0.1))} so'm)`, `pay_drv_${coll.id}`)],
                                    [btn(`💰 Ikkalasiga to'lash`, `pay_both_${coll.id}`)],
                                ],
                            },
                        }
                    );
                }
            }

            // ── Haydovchi: Orqaga qaytish ────────────────────────────────
            if (data.startsWith('force_back_')) {
                const collectionId = parseInt(data.replace('force_back_', ''));
                const coll = await prisma.recycleCollection.findUnique({
                    where: { id: collectionId },
                    include: { request: { include: { point: true } } },
                });
                if (!coll) { await ctx.answerCbQuery('Topilmadi'); return; }

                const matInfo = MAT[coll.materialType || 'mix'] || MAT.mix;
                const isPickup = coll.request.pickupType === 'pickup';
                const basePrice = coll.request.point?.pricePerKg || matInfo.price;

                await ctx.answerCbQuery('🔙');
                await ctx.editMessageText(
                    `✅ <b>Yig'ish yakunlandi! #${coll.requestId}</b>\n\n` +
                    `${matInfo.emoji} ${matInfo.label}\n⚖️ Og'irlik: ${coll.actualWeight} kg\n` +
                    `${coll.discountPercent > 0 ? `🏷️ Chegirma: ${coll.discountPercent}% → ${coll.effectiveWeight.toFixed(1)} kg\n` : ''}` +
                    `💰 Narx: ${fmtN(basePrice)} so'm/kg\n` +
                    `${isPickup ? `🚚 Mashina xizmati: -50% → ${fmtN(coll.pricePerKg)} so'm/kg\n` : ''}` +
                    `━━━━━━━━━━━━━━━━━━\n💵 <b>Jami: ${fmtN(coll.totalAmount)} so'm</b>\n\n` +
                    `⏳ Mijoz tasdiqlashini kuting...`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: [[btn('🔄 Qo\'lda yakunlash (mijoz tasdiqlamasa)', `force_${collectionId}`)]] },
                    }
                );
            }

            // ── Masul: To'lovni tasdiqlash ──────────────────────────────────
            if (data.startsWith('pay_cust_') || data.startsWith('pay_drv_') || data.startsWith('pay_both_')) {
                const parts = data.split('_');
                const payType = `${parts[0]}_${parts[1]}`;
                const collectionId = parseInt(parts[2]);
                const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
                if (!sup) { await ctx.answerCbQuery('❌ Ruxsat yo\'q'); return; }

                const coll = await prisma.recycleCollection.findUnique({
                    where: { id: collectionId },
                    include: { request: true, driver: true },
                });
                if (!coll) { await ctx.answerCbQuery('Topilmadi'); return; }

                const paymentStatus = payType === 'pay_cust' ? 'paid_to_customer' : payType === 'pay_drv' ? 'paid_to_driver' : 'paid_both';
                const payToCust = payType !== 'pay_drv' ? coll.totalAmount : null;
                const payToDrv  = payType !== 'pay_cust' ? Math.round(coll.totalAmount * 0.1) : null;

                await prisma.recycleCollection.update({
                    where: { id: collectionId },
                    data: { paymentStatus, paymentToCustomer: payToCust ?? undefined, paymentToDriver: payToDrv ?? undefined, paidBy: sup.name, paidAt: new Date() },
                });

                await prisma.recycleRequest.update({
                    where: { id: coll.requestId },
                    data: { status: 'completed', completedAt: new Date() },
                });

                if (coll.driver) {
                    await prisma.driver.update({ where: { id: coll.driver.id }, data: { status: 'active' } });
                }

                await ctx.answerCbQuery('✅ To\'lov amalga oshirildi!');
                const icon  = payType === 'pay_cust' ? '👤' : payType === 'pay_drv' ? '🚚' : '💰';
                const label = payType === 'pay_cust' ? 'Mijozga' : payType === 'pay_drv' ? 'Haydovchiga' : 'Ikkalasiga';
                await ctx.editMessageText(
                    `✅ <b>To'lov amalga oshirildi!</b>\n\n${icon} ${label}: <b>${fmtN(payToCust ?? payToDrv ?? 0)} so'm</b>\n👷 Tasdiqladi: ${sup.name}\n📋 Ariza #${coll.requestId}\n\n🟢 <b>Ariza yakunlandi!</b>`,
                    { parse_mode: 'HTML' }
                );

                if (payToCust && coll.request.customerTgId) {
                    await bot.telegram.sendMessage(coll.request.customerTgId,
                        `💰 <b>To'lov amalga oshirildi!</b>\n\nAriza #${coll.requestId}\n💵 <b>${fmtN(payToCust)} so'm</b>\n✅ Rahmat! Qayta murojaat qiling ♻️`,
                        { parse_mode: 'HTML' }
                    );
                }
                if (payToDrv && coll.driver.telegramId) {
                    await bot.telegram.sendMessage(coll.driver.telegramId,
                        `💰 <b>Ish haqi o'tkazildi!</b>\n\nAriza #${coll.requestId}\n💵 <b>${fmtN(payToDrv)} so'm</b>\n✅ Rahmat! 🚚`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

        } catch (error) {
            console.error('[Bot Callback]', error);
            await ctx.answerCbQuery('Xatolik yuz berdi');
        }
    });
}
