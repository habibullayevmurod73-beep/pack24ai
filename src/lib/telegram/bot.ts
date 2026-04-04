import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';


let botInstance: Telegraf | null = null;

// ─── Yordamchi: Inline button yaratish ──────────────────────────────────────
function btn(text: string, data: string) {
    return { text, callback_data: data };
}

// ─── Bot yaratish va handlerlarni ro'yxatdan o'tkazish ─────────────────────
export const getBot = async () => {
    if (botInstance) return botInstance;

    const config = await prisma.telegramConfig.findFirst();
    if (!config || !config.botToken) {
        console.warn('Telegram Bot Token not configured');
        return null;
    }

    const bot = new Telegraf(config.botToken);

    // Middleware — log
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        console.log(`TG Update ${ctx.update.update_id} in ${Date.now() - start}ms`);
    });

    // ════════════════════════════════════════════════════════════════════════
    // /start — Rolni aniqlash
    // ════════════════════════════════════════════════════════════════════════
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const name = ctx.from.first_name || 'Foydalanuvchi';

        // Rolni aniqlash
        const supervisor = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (supervisor) {
            ctx.reply(
                `👷 Salom, <b>${supervisor.name}</b>!\n\nSiz <b>masul shaxs</b> sifatida tizimga ulangansiz.\n\nBuyruqlar:\n/arizalar — Sizga yo'naltirilgan arizalar\n/haydovchilar — Sizning haydovchilaringiz\n/hisobot — Oylik hisobot`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) {
            // Haydovchini online qilish
            await prisma.driver.update({ where: { id: driver.id }, data: { isOnline: true, lastSeenAt: new Date() } });
            ctx.reply(
                `🚚 Salom, <b>${driver.name}</b>!\n\nSiz <b>haydovchi</b> sifatida tizimga ulangansiz.\nHolat: 🟢 Online\n\nBuyruqlar:\n/ishlarim — Tayinlangan ishlar\n/status — Online/Offline\n/hisobot — Mening hisobotim`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Mijoz yoki yangi foydalanuvchi
        const existing = await prisma.recycleRequest.findFirst({ where: { customerTgId: tgId }, orderBy: { createdAt: 'desc' } });
        if (existing) {
            ctx.reply(
                `♻️ Salom, <b>${name}</b>!\n\nSizning oxirgi ariza: <b>#${existing.id}</b> — ${getStatusLabel(existing.status)}\n\nBuyruqlar:\n/arizalarim — Mening arizalarim\n/ariza — Yangi ariza yuborish\n/shikoyat — Shikoyat qoldirish`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Yangi foydalanuvchi
        ctx.reply(
            config.welcomeMessage
                .replace('{user}', name)
                .replace('{bot}', ctx.botInfo.first_name) +
            `\n\n♻️ Makulatura topshirish uchun /ariza buyrug'ini yuboring!`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        [{ text: config.mainButton, web_app: { url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz'}/mobile` } }],
                        [{ text: '♻️ Ariza yuborish' }],
                    ],
                    resize_keyboard: true,
                },
            }
        );
    });

    // ════════════════════════════════════════════════════════════════════════
    // MASUL SHAXS buyruqlari
    // ════════════════════════════════════════════════════════════════════════
    bot.command('arizalar', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const supervisor = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!supervisor) { ctx.reply('❌ Siz masul shaxs sifatida ro\'yxatga olinmagansiz.'); return; }

        const requests = await prisma.recycleRequest.findMany({
            where: { supervisorId: supervisor.id, status: { in: ['dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] } },
            include: { point: true, assignedDriver: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        if (requests.length === 0) { ctx.reply('📋 Hozircha aktiv ariza yo\'q.'); return; }

        for (const r of requests) {
            const buttons = [];
            if (r.status === 'dispatched') {
                // Haydovchilar ro'yxati
                const drivers = await prisma.driver.findMany({
                    where: { supervisorId: supervisor.id, status: 'active' },
                });
                for (const d of drivers.slice(0, 5)) {
                    buttons.push([btn(`🚚 ${d.name}ga tayinlash`, `assign_${r.id}_${d.id}`)]);
                }
            }

            ctx.reply(
                `📋 <b>Ariza #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `👤 ${r.name} | 📞 ${r.phone}\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `${r.address ? `🏠 ${r.address}\n` : ''}` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}\n` +
                `${r.assignedDriver ? `🚚 Haydovchi: ${r.assignedDriver.name}` : ''}`,
                {
                    parse_mode: 'HTML',
                    ...(buttons.length > 0 && { reply_markup: { inline_keyboard: buttons } }),
                }
            );
        }
    });

    bot.command('haydovchilar', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!sup) { ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.'); return; }

        const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
        if (drivers.length === 0) { ctx.reply('🚚 Haydovchilar yo\'q.'); return; }

        const list = drivers.map((d) =>
            `${d.isOnline ? '🟢' : '⚫'} <b>${d.name}</b> — ${d.status === 'on_route' ? '🚚 Yo\'lda' : d.status === 'busy' ? '📦 Band' : d.isOnline ? 'Faol' : 'Offline'}\n   📞 ${d.phone}`
        ).join('\n\n');

        ctx.reply(`🚚 <b>Sizning haydovchilar (${drivers.length}):</b>\n\n${list}`, { parse_mode: 'HTML' });
    });

    // ════════════════════════════════════════════════════════════════════════
    // HAYDOVCHI buyruqlari
    // ════════════════════════════════════════════════════════════════════════
    bot.command('ishlarim', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (!driver) { ctx.reply('❌ Siz haydovchi sifatida ro\'yxatga olinmagansiz.'); return; }

        const requests = await prisma.recycleRequest.findMany({
            where: { assignedDriverId: driver.id, status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] } },
            include: { point: true },
            orderBy: { createdAt: 'desc' },
        });

        if (requests.length === 0) { ctx.reply('📋 Hozircha ish yo\'q. Dam oling! 😊'); return; }

        for (const r of requests) {
            const buttons = [];
            if (r.status === 'assigned') buttons.push([btn('✅ Qabul qildim — yo\'lga chiqaman', `enroute_${r.id}`)]);
            if (r.status === 'en_route') buttons.push([btn('📍 Yetib keldim', `arrived_${r.id}`)]);
            if (r.status === 'arrived') buttons.push([btn('📦 Yuk yig\'ishni boshlayman', `collecting_${r.id}`)]);
            if (r.status === 'collecting') buttons.push([btn('⚖️ Kalkulator — og\'irlik kiritish', `calc_${r.id}`)]);

            ctx.reply(
                `🚚 <b>Ish #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `👤 ${r.name} | 📞 ${r.phone}\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `${r.address ? `🏠 ${r.address}\n` : ''}` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }
            );
        }
    });

    bot.command('status', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (!driver) return;

        const newStatus = !driver.isOnline;
        await prisma.driver.update({ where: { id: driver.id }, data: { isOnline: newStatus, lastSeenAt: new Date() } });
        ctx.reply(newStatus ? '🟢 Siz endi <b>ONLINE</b> — ish qabul qilishingiz mumkin' : '⚫ Siz endi <b>OFFLINE</b> — dam oling', { parse_mode: 'HTML' });
    });

    // ════════════════════════════════════════════════════════════════════════
    // MIJOZ buyruqlari
    // ════════════════════════════════════════════════════════════════════════
    bot.command('arizalarim', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const requests = await prisma.recycleRequest.findMany({
            where: { customerTgId: tgId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { point: true, assignedDriver: true },
        });

        if (requests.length === 0) { ctx.reply('📋 Sizda hali ariza yo\'q.\n\nYangi ariza uchun /ariza buyrug\'ini yuboring!'); return; }

        for (const r of requests) {
            ctx.reply(
                `📋 <b>Ariza #${r.id}</b> — ${getStatusLabel(r.status)}\n\n` +
                `📍 ${r.point?.regionUz || '—'}\n` +
                `📦 ${r.material || '—'} | ⚖️ ${r.volume ? r.volume + ' kg' : '—'}\n` +
                `${r.assignedDriver ? `🚚 Haydovchi: ${r.assignedDriver.name}\n` : ''}` +
                `📅 ${new Date(r.createdAt).toLocaleDateString('uz')}`,
                { parse_mode: 'HTML' }
            );
        }
    });

    bot.command('shikoyat', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const lastRequest = await prisma.recycleRequest.findFirst({ where: { customerTgId: tgId }, orderBy: { createdAt: 'desc' } });

        if (!lastRequest) { ctx.reply('❌ Avval ariza yuborishingiz kerak.'); return; }

        ctx.reply(
            `⚠️ <b>Shikoyat qoldirish</b>\n\nAriza #${lastRequest.id} bo'yicha shikoyatingizni yozing.\nShikoyat matninigina yuboring (keyingi xabar sifatida):`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn('👷 Masulga shikoyat', `complaint_supervisor_${lastRequest.id}`)],
                        [btn('🏢 Direktorga shikoyat', `complaint_director_${lastRequest.id}`)],
                    ],
                },
            }
        );
    });

    // ════════════════════════════════════════════════════════════════════════
    // INLINE CALLBACK HANDLER (barcha rollar)
    // ════════════════════════════════════════════════════════════════════════
    bot.on('callback_query', async (ctx) => {
        const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
        if (!data) return;
        const tgId = ctx.from.id.toString();

        try {
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

                // Mijozga xabar
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

                // Sessiyani saqlash — weightInput state
                await prisma.driver.update({
                    where: { telegramId: tgId },
                    data: { vehicleInfo: `CALC_${requestId}` }, // Temporary state marker
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

                // Masulga xabar
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { supervisor: true } });
                if (req?.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `❌ <b>Haydovchi rad etdi!</b>\n\nAriza #${requestId}\nHaydovchi: ${driver?.name}\n\nIltimos, boshqa haydovchi tayinlang!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }

            // ── Mijoz: Tasdiqlash / Inkor ───────────────────────────────────
            if (data.startsWith('confirm_')) {
                const collectionId = parseInt(data.split('_')[1]);
                await prisma.recycleCollection.update({ where: { id: collectionId }, data: { customerConfirmed: true } });
                const coll = await prisma.recycleCollection.findUnique({ where: { id: collectionId }, include: { request: true } });
                if (coll) await prisma.recycleRequest.update({ where: { id: coll.requestId }, data: { status: 'confirmed', confirmedAt: new Date() } });

                await ctx.answerCbQuery('✅ Tasdiqlandi!');
                await ctx.editMessageText(`✅ <b>Tasdiqlandi!</b>\n\nRahmat! Ma'lumotlar to'g'ri deb tasdiqlandi.\nTo'lov tez orada amalga oshiriladi. ♻️`, { parse_mode: 'HTML' });
            }

            if (data.startsWith('deny_')) {
                const collectionId = parseInt(data.split('_')[1]);
                await prisma.recycleCollection.update({ where: { id: collectionId }, data: { customerConfirmed: false } });
                const coll = await prisma.recycleCollection.findUnique({ where: { id: collectionId }, include: { request: true } });
                if (coll) await prisma.recycleRequest.update({ where: { id: coll.requestId }, data: { status: 'disputed' } });

                await ctx.answerCbQuery('❌ Inkor qilindi');
                await ctx.editMessageText(`❌ <b>Inkor qilindi!</b>\n\nMa'lumotlar noto'g'ri deb belgilandi.\nMasul shaxs siz bilan bog'lanadi.\n\nShikoyat uchun /shikoyat buyrug'ini yuboring.`, { parse_mode: 'HTML' });
            }

            // ── Mijoz: Shikoyat darajasi tanlash ────────────────────────────
            if (data.startsWith('complaint_supervisor_') || data.startsWith('complaint_director_')) {
                const parts = data.split('_');
                const level = parts[1]; // supervisor yoki director
                const requestId = parseInt(parts[2]);

                // Sessiyani saqlash
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId } });
                if (!req) { await ctx.answerCbQuery('Ariza topilmadi'); return; }

                await ctx.answerCbQuery(`${level === 'director' ? '🏢 Direktor' : '👷 Masul'}ga shikoyat`);
                await ctx.editMessageText(
                    `⚠️ <b>Shikoyat — ${level === 'director' ? 'Direktor' : 'Masul shaxs'}ga</b>\n\nAriza #${requestId}\n\n📝 Endi shikoyat matninigini yozing (keyingi xabar sifatida):`,
                    { parse_mode: 'HTML' }
                );

                // State saqlash (complaint_level_requestId formatida)
                // Buni text handler'da o'qiymiz
            }

        } catch (error) {
            console.error('[Bot Callback]', error);
            await ctx.answerCbQuery('Xatolik yuz berdi');
        }
    });

    // ════════════════════════════════════════════════════════════════════════
    // TEXT HANDLER — Haydovchi kalkulator va shikoyat uchun
    // ════════════════════════════════════════════════════════════════════════
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        // Agar /buyruq bo'lsa — skip
        if (text.startsWith('/')) return;

        // ── Haydovchi: Og'irlik kiritish (CALC_ state) ──────────────────
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver?.vehicleInfo?.startsWith('CALC_')) {
            const requestId = parseInt(driver.vehicleInfo.split('_')[1]);
            const weight = parseFloat(text.replace(',', '.'));

            if (isNaN(weight) || weight <= 0) {
                ctx.reply('❌ Noto\'g\'ri format! Faqat raqam kiriting (masalan: 150)');
                return;
            }

            // Og'irlik kiritildi, endi chegirma so'rash
            await prisma.driver.update({
                where: { id: driver.id },
                data: { vehicleInfo: `DISCOUNT_${requestId}_${weight}` },
            });

            ctx.reply(
                `⚖️ Og'irlik: <b>${weight} kg</b>\n\n` +
                `Chegirma foizini kiriting (0 dan 50 gacha):\n` +
                `<i>Masalan: 15 (namlik uchun)</i>\n` +
                `Chegirma yo'q bo'lsa <b>0</b> yozing.`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (driver?.vehicleInfo?.startsWith('DISCOUNT_')) {
            const parts = driver.vehicleInfo.split('_');
            const requestId = parseInt(parts[1]);
            const weight = parseFloat(parts[2]);
            const discount = parseFloat(text.replace(',', '.'));

            if (isNaN(discount) || discount < 0 || discount > 50) {
                ctx.reply('❌ Chegirma 0 dan 50 gacha bo\'lishi kerak!');
                return;
            }

            const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { point: true } });
            if (!req) { ctx.reply('❌ Ariza topilmadi'); return; }

            const price = req.point?.pricePerKg || 800;
            const effectiveWeight = weight - (weight * discount / 100);
            const totalAmount = Math.round(effectiveWeight * price);

            // Collection yaratish
            const collection = await prisma.recycleCollection.create({
                data: {
                    requestId, driverId: driver.id,
                    actualWeight: weight, discountPercent: discount,
                    effectiveWeight, pricePerKg: price, totalAmount,
                    materialType: req.material, collectedAt: new Date(),
                },
            });

            // Ariza statusini yangilash
            await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'collected', collectedAt: new Date() } });
            // Haydovchi state tozalash
            await prisma.driver.update({ where: { id: driver.id }, data: { vehicleInfo: null, status: 'active' } });

            ctx.reply(
                `✅ <b>Yig'ish yakunlandi! #${requestId}</b>\n\n` +
                `⚖️ Og'irlik: ${weight} kg\n` +
                `${discount > 0 ? `🏷️ Chegirma: ${discount}%\n📊 Hisoblangan: ${effectiveWeight.toFixed(1)} kg\n` : ''}` +
                `💰 Narx: ${price.toLocaleString('ru-RU')} so'm/kg\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `💵 <b>Jami: ${totalAmount.toLocaleString('ru-RU')} so'm</b>`,
                { parse_mode: 'HTML' }
            );

            // Mijozga xabar (ixtiyoriy)
            if (req.customerTgId) {
                await bot.telegram.sendMessage(req.customerTgId,
                    `📦 <b>Makulatura yig'ildi! #${requestId}</b>\n\n` +
                    `⚖️ Og'irlik: <b>${weight} kg</b>\n` +
                    `${discount > 0 ? `🏷️ Chegirma: <b>${discount}%</b>\n📊 Hisoblangan: <b>${effectiveWeight.toFixed(1)} kg</b>\n` : ''}` +
                    `💰 Narx: <b>${price.toLocaleString('ru-RU')} so'm/kg</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `💵 Jami: <b>${totalAmount.toLocaleString('ru-RU')} so'm</b>\n\n` +
                    `Ma'lumotlar to'g'rimi?`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('✅ Tasdiqlash', `confirm_${collection.id}`), btn('❌ Inkor qilish', `deny_${collection.id}`)],
                            ],
                        },
                    }
                );
            }

            // Masulga xabar
            if (req.supervisorId) {
                const sup = await prisma.supervisor.findUnique({ where: { id: req.supervisorId } });
                if (sup?.telegramId) {
                    await bot.telegram.sendMessage(sup.telegramId,
                        `📦 Ariza #${requestId} — yuk yig'ildi\n⚖️ ${weight} kg | 💵 ${totalAmount.toLocaleString('ru-RU')} so'm\n🚚 ${driver.name}`,
                        { parse_mode: 'HTML' }
                    );
                }
            }
            return;
        }
    });

    // Help
    bot.help((ctx) => {
        ctx.reply(
            `📋 <b>Buyruqlar:</b>\n\n` +
            `<b>Barcha foydalanuvchilar:</b>\n` +
            `/start — Botni ishga tushirish\n\n` +
            `<b>Masul shaxs:</b>\n` +
            `/arizalar — Aktiv arizalar\n` +
            `/haydovchilar — Haydovchilar ro'yxati\n\n` +
            `<b>Haydovchi:</b>\n` +
            `/ishlarim — Tayinlangan ishlar\n` +
            `/status — Online/Offline\n\n` +
            `<b>Mijoz:</b>\n` +
            `/arizalarim — Mening arizalarim\n` +
            `/shikoyat — Shikoyat qoldirish`,
            { parse_mode: 'HTML' }
        );
    });

    botInstance = bot;
    return bot;
};

// ─── Reset ──────────────────────────────────────────────────────────────────
export const resetBot = () => { botInstance = null; };

// ─── Admin xabar yuborish (salesChatId ga) ──────────────────────────────────
export const sendTelegramMessage = async (message: string) => {
    try {
        const bot = await getBot();
        if (!bot) return false;

        const config = await prisma.telegramConfig.findFirst();
        if (!config || !config.salesChatId) return false;

        const chatIds = config.salesChatId.split(',').map((id: string) => id.trim());
        for (const chatId of chatIds) {
            if (chatId) await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
        return true;
    } catch (error) {
        console.error('Telegramga xabar yuborishda xatolik:', error);
        return false;
    }
};

// ─── Yordamchi: Status label ────────────────────────────────────────────────
function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        new: '🔵 Yangi', dispatched: '📤 Yo\'naltirildi', assigned: '👤 Tayinlandi',
        en_route: '🚚 Yo\'lda', arrived: '📍 Yetib keldi', collecting: '📦 Yig\'ilmoqda',
        collected: '✅ Yig\'ildi', confirmed: '💚 Tasdiqlandi', completed: '🟢 Bajarildi',
        disputed: '⚠️ Bahsli', cancelled: '🔴 Bekor',
    };
    return labels[status] || status;
}
