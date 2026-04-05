import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';

// ─── Material narxlari (so'm/kg) ─────────────────────────────────────────────
const MAT: Record<string, { label: string; emoji: string; price: number }> = {
    qogoz:   { label: "Qog'oz (rangsiz)",  emoji: '📄', price: 600  },
    karton:  { label: 'Karton',            emoji: '📦', price: 700  },
    plastik: { label: 'Plastik',           emoji: '🧴', price: 1000 },
    temir:   { label: 'Temir/Metallar',   emoji: '🔩', price: 2000 },
    shisha:  { label: 'Shisha',            emoji: '🫙', price: 300  },
    gazeta:  { label: 'Gazeta',            emoji: '📰', price: 400  },
    mix:     { label: 'Aralash',           emoji: '🗑️', price: 500  },
};

const fmtN = (n: number) => n.toLocaleString('ru-RU');

// ─── In-memory session state ──────────────────────────────────────────────────
interface ArizaSession {
    step: 'name' | 'phone' | 'region' | 'material' | 'volume' | 'address' | 'confirm';
    name?: string;
    phone?: string;
    regionId?: number;
    material?: string;
    volume?: number;
    address?: string;
}
const arizaSessions = new Map<string, ArizaSession>();

// Shikoyat sessiyasi
interface ComplaintSession {
    requestId: number;
    level: 'supervisor' | 'director';
}
const complaintSessions = new Map<string, ComplaintSession>();

// ─── Rol-based persistent keyboard ──────────────────────────────────────────
function customerKeyboard(mainButton?: string, appUrl?: string) {
    const rows: any[][] = [];
    if (mainButton && appUrl) {
        rows.push([{ text: mainButton, web_app: { url: `${appUrl}/mobile` } }]);
    }
    rows.push(
        [{ text: '♻️ Ariza yuborish' }, { text: '📋 Arizalarim' }],
        [{ text: '📦 Buyurtmalarim' }, { text: '📞 Aloqa' }],
    );
    return { keyboard: rows, resize_keyboard: true };
}
function supervisorKeyboard() {
    return {
        keyboard: [
            [{ text: '📋 Arizalar' }, { text: '🚚 Haydovchilar' }],
            [{ text: '📊 Hisobot' }, { text: '💰 To\'lovlar' }],
        ],
        resize_keyboard: true,
    };
}
function driverKeyboard() {
    return {
        keyboard: [
            [{ text: '📋 Ishlarim' }, { text: '🔄 Status' }],
            [{ text: '📊 Hisobot' }],
        ],
        resize_keyboard: true,
    };
}

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

    // ─── Buyruqlar menyusini ro'yxatga olish ──────────────────────────────
    await bot.telegram.setMyCommands([
        { command: 'start',      description: '🏠 Bosh menyu' },
        { command: 'ariza',      description: '♻️ Makulatura topshirish' },
        { command: 'arizalarim', description: '📋 Mening arizalarim' },
        { command: 'buyurtma',   description: '📦 Buyurtmani kuzatish' },
        { command: 'narxlar',    description: '💰 Material narxlari' },
        { command: 'help',       description: '❓ Yordam' },
    ]).catch(() => {});

    // Middleware — log
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        console.log(`TG ${ctx.updateType} in ${Date.now() - start}ms`);
    });

    // ════════════════════════════════════════════════════════════════════════
    // /start — Rolni aniqlash
    // ════════════════════════════════════════════════════════════════════════
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();
        const name = ctx.from.first_name || 'Foydalanuvchi';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz';

        // ── MASUL SHAXS ──
        const supervisor = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (supervisor) {
            const activeCount = await prisma.recycleRequest.count({
                where: { supervisorId: supervisor.id, status: { in: ['dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] } }
            });
            await ctx.reply(
                `👷 Salom, <b>${supervisor.name}</b>!\n\n` +
                `Siz <b>masul shaxs</b> sifatida tizimga ulangansiz.\n\n` +
                `📋 Aktiv arizalar: <b>${activeCount}</b>\n\n` +
                `Quyidagi tugmalar orqali boshqaring 👇`,
                { parse_mode: 'HTML', reply_markup: supervisorKeyboard() }
            );
            return;
        }

        // ── HAYDOVCHI ──
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) {
            await prisma.driver.update({ where: { id: driver.id }, data: { isOnline: true, lastSeenAt: new Date() } });
            const jobCount = await prisma.recycleRequest.count({
                where: { assignedDriverId: driver.id, status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] } }
            });
            await ctx.reply(
                `🚚 Salom, <b>${driver.name}</b>!\n\n` +
                `Holat: 🟢 <b>Online</b>\n` +
                `📋 Aktiv ishlar: <b>${jobCount}</b>\n\n` +
                `Quyidagi tugmalar orqali boshqaring 👇`,
                { parse_mode: 'HTML', reply_markup: driverKeyboard() }
            );
            return;
        }

        // ── MIJOZ (mavjud) ──
        const existing = await prisma.recycleRequest.findFirst({ where: { customerTgId: tgId }, orderBy: { createdAt: 'desc' } });
        if (existing) {
            await ctx.reply(
                `♻️ Salom, <b>${name}</b>!\n\n` +
                `Oxirgi ariza: <b>#${existing.id}</b> — ${getStatusLabel(existing.status)}\n\n` +
                `Quyidagi tugmalar orqali foydalaning 👇`,
                { parse_mode: 'HTML', reply_markup: customerKeyboard(config.mainButton, appUrl) }
            );
            return;
        }

        // ── YANGI FOYDALANUVCHI ──
        await ctx.reply(
            `🏭 <b>Pack24 — Qadoqlash Yechimlari</b>\n\n` +
            `Salom, <b>${name}</b>! \n\n` +
            `Biz orqali siz:\n` +
            `📦 Qadoqlash mahsulotlarini buyurtma qilishingiz\n` +
            `♻️ Makulaturani topshirib pul ishlashingiz\n` +
            `📊 Buyurtmalaringizni kuzatishingiz mumkin\n\n` +
            `Boshlash uchun quyidagi tugmalardan foydalaning 👇`,
            { parse_mode: 'HTML', reply_markup: customerKeyboard(config.mainButton, appUrl) }
        );
    });

    // ════════════════════════════════════════════════════════════════════════
    // /ariza — Mijoz ariza yuborish flow boshlanishi
    // ════════════════════════════════════════════════════════════════════════
    const startArizaFlow = async (ctx: Context) => {
        const tgId = ctx.from!.id.toString();
        const name = ctx.from!.first_name || '';

        // Agar allaqachon driver yoki supervisor bo'lsa — chiqish
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) { await ctx.reply('🚚 Siz haydovchisiz — /ishlarim buyrug\'ini ishlating.'); return; }
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (sup) { await ctx.reply('👷 Siz masulsiz — /arizalar buyrug\'ini ishlating.'); return; }

        // Session boshlanishi — ism so'rash
        arizaSessions.set(tgId, { step: 'name', name });
        await ctx.reply(
            `♻️ <b>Yangi ariza yuborish</b>\n\n` +
            `Iltimos, Ismingiz va Familiyangizni (F.I.SH.) kiriting:`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn(`📝 ${name}`, `ariza_usename`)],
                        [btn('❌ Bekor qilish', 'ariza_cancel')],
                    ],
                },
            }
        );
    };

    bot.command('ariza', startArizaFlow);

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
                    // O'zi olib keladi — ariza yaratish
                    await ctx.answerCbQuery('✅');
                    await createArizaFromSession(ctx, tgId, 'base', null);
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
                const level = parts[1];
                const requestId = parseInt(parts[2]);
                const req = await prisma.recycleRequest.findUnique({ where: { id: requestId } });
                if (!req) { await ctx.answerCbQuery('Ariza topilmadi'); return; }
                await ctx.answerCbQuery(`${level === 'director' ? '🏢 Direktor' : '👷 Masul'}ga shikoyat`);
                await ctx.editMessageText(
                    `⚠️ <b>Shikoyat — ${level === 'director' ? 'Direktor' : 'Masul shaxs'}ga</b>\n\nAriza #${requestId}\n\n📝 Shikoyat matninigini yozing:`,
                    { parse_mode: 'HTML' }
                );
            }

            // ── Haydovchi: Material tanlash ─────────────────────────────────
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
                let price = req.point?.pricePerKg || matInfo.price;
                if (req.pickupType === 'pickup') {
                    price = price * 0.5; // -50% pickup uchun
                }

                const effectiveWeight = weight - (weight * discount / 100);
                const totalAmount = Math.round(effectiveWeight * price);

                const collection = await prisma.recycleCollection.create({
                    data: { requestId, driverId: driver.id, actualWeight: weight, discountPercent: discount, effectiveWeight, pricePerKg: price, totalAmount, materialType, collectedAt: new Date() },
                });
                await prisma.recycleRequest.update({ where: { id: requestId }, data: { status: 'collected', collectedAt: new Date() } });
                await prisma.driver.update({ where: { id: driver.id }, data: { vehicleInfo: null, status: 'active' } });

                await ctx.answerCbQuery('✅ Yig\'ish yakunlandi!');
                await ctx.editMessageText(
                    `✅ <b>Yig'ish yakunlandi! #${requestId}</b>\n\n` +
                    `${matInfo.emoji} ${matInfo.label}\n` +
                    `⚖️ ${weight} kg${discount > 0 ? ` → ${effectiveWeight.toFixed(1)} kg (${discount}%)` : ''}\n` +
                    `💰 ${fmtN(price)} so'm/kg\n━━━━━━━━━━━━━━━━━━\n💵 <b>Jami: ${fmtN(totalAmount)} so'm</b>`,
                    { parse_mode: 'HTML' }
                );

                // Mijozga xabar
                if (req.customerTgId) {
                    await bot.telegram.sendMessage(req.customerTgId,
                        `📦 <b>Makulatura yig'ildi! #${requestId}</b>\n\n` +
                        `${matInfo.emoji} Material: <b>${matInfo.label}</b>\n` +
                        `⚖️ Og'irlik: <b>${weight} kg</b>\n` +
                        `${discount > 0 ? `🏷️ Chegirma: <b>${discount}%</b> → ${effectiveWeight.toFixed(1)} kg\n` : ''}` +
                        `💰 Narx: <b>${fmtN(price)} so'm/kg</b>\n━━━━━━━━━━━━━━━━━━\n` +
                        `💵 Jami: <b>${fmtN(totalAmount)} so'm</b>\n\nMa'lumotlar to'g'rimi?`,
                        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[btn('✅ Tasdiqlash', `confirm_${collection.id}`), btn('❌ Inkor qilish', `deny_${collection.id}`)]] } }
                    );
                }

                // Masulga xabar + to'lov tugmasi
                if (req.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `📦 <b>Ariza #${requestId} — yig'ildi</b>\n\n` +
                        `${matInfo.emoji} ${matInfo.label}\n` +
                        `⚖️ ${weight} kg${discount > 0 ? ` → ${effectiveWeight.toFixed(1)} kg (${discount}%)` : ''}\n` +
                        `💵 <b>${fmtN(totalAmount)} so'm</b>\n` +
                        `🚚 Haydovchi: ${driver.name}\n` +
                        `👤 Mijoz: ${req.name} | ${req.phone}\n\n` +
                        `Mijoz tasdiqlashini kuting yoki to'lovni boshlang:`,
                        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
                            [btn(`💵 Mijozga to'lash`, `pay_cust_${collection.id}`)],
                            [btn(`🚚 Haydovchiga to'lash (10%)`, `pay_drv_${collection.id}`)],
                            [btn(`💰 Ikkalasiga to'lash`, `pay_both_${collection.id}`)],
                        ] } }
                    );
                }
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
                    data: { paymentStatus, paymentToCustomer: payToCust ?? undefined, paymentToDriver: payToDrv ?? undefined, paidBy: sup.name },
                });
                await ctx.answerCbQuery('✅ To\'lov amalga oshirildi!');
                const icon  = payType === 'pay_cust' ? '👤' : payType === 'pay_drv' ? '🚚' : '💰';
                const label = payType === 'pay_cust' ? 'Mijozga' : payType === 'pay_drv' ? 'Haydovchiga' : 'Ikkalasiga';
                await ctx.editMessageText(
                    `✅ <b>To'lov amalga oshirildi!</b>\n\n${icon} ${label}: <b>${fmtN(payToCust ?? payToDrv ?? 0)} so'm</b>\n👷 Tasdiqladi: ${sup.name}\n📋 Ariza #${coll.requestId}`,
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

            // ─── SHIKOYAT: ariza tanlash ──────────────────────────────────
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
                    `⚠️ <b>Shikoyat darajasini tanlang:</b>\n\n` +
                    `📋 Ariza: <b>#${reqId}</b>`,
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
                // complaint_level_supervisor_123 or complaint_level_director_123
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

            // ─── MY_ORDERS: So'nggi buyurtmalar ──────────────────────────
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

        } catch (error) {
            console.error('[Bot Callback]', error);
            await ctx.answerCbQuery('Xatolik yuz berdi');
        }
    });

    // ════════════════════════════════════════════════════════════════════════
    // CONTACT HANDLER — Telefon raqamini tugma orqali olish
    // ════════════════════════════════════════════════════════════════════════
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const contact = ctx.message.contact;

        const ses = arizaSessions.get(tgId);
        if (ses && ses.step === 'phone') {
            ses.phone = contact.phone_number;
            ses.step = 'region';

            // Hududlar ro'yxati
            const points = await prisma.recyclePoint.findMany({ where: { status: 'active' }, orderBy: { regionUz: 'asc' } });
            if (points.length === 0) {
                arizaSessions.delete(tgId);
                await ctx.reply('❌ Hozircha aktiv yig\'ish hududlari yo\'q. Keyinroq qayta urinib ko\'ring.', { reply_markup: { remove_keyboard: true } });
                return;
            }

            const regionButtons = points.map(p =>
                [btn(`📍 ${p.regionUz} — ${p.cityUz}`, `ariza_region_${p.id}`)]
            );
            regionButtons.push([btn('❌ Bekor qilish', 'ariza_cancel')]);

            await ctx.reply(
                `📍 <b>Hududingizni tanlang:</b>`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: regionButtons } }
            );

            // Hide the normal reply keyboard
            await bot.telegram.sendMessage(ctx.chat.id, 'Davom etish...', { reply_markup: { remove_keyboard: true } }).then(m => bot.telegram.deleteMessage(ctx.chat.id, m.message_id)).catch(() => {});
            return;
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

        // ── "♻️ Ariza yuborish" tugmasi ─────────────────────────────────
        if (text === '♻️ Ariza yuborish') {
            await startArizaFlow(ctx);
            return;
        }

        // ── ARIZA SESSION: bosqichma-bosqich ─────────────────────────────
        const ses = arizaSessions.get(tgId);
        if (text === '❌ Bekor qilish' && ses) {
            arizaSessions.delete(tgId);
            await ctx.reply('❌ Ariza bekor qilindi.', { reply_markup: customerKeyboard(config.mainButton, process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz') });
            return;
        }

        if (ses) {
            // 1. Ism kiritish
            if (ses.step === 'name') {
                ses.name = text.trim();
                ses.step = 'phone';
                await ctx.reply(
                    `👤 F.I.SH.: <b>${ses.name}</b>\n\n📱 Iltimos, telefon raqamingizni pastdagi tugma orqali yuboring:\n<i>Yoki raqamni qo'lda kiriting: 998901234567</i>`,
                    { 
                        parse_mode: 'HTML',
                        reply_markup: {
                            keyboard: [
                                [{ text: '📱 Kontakt yuborish', request_contact: true }],
                                [{ text: '❌ Bekor qilish' }]
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    }
                );
                return;
            }

            // 2. Telefon kiritish
            if (ses.step === 'phone') {
                const phone = text.replace(/[^0-9+]/g, '');
                if (phone.length < 9) {
                    await ctx.reply('❌ Telefon raqami noto\'g\'ri! Kamida 9 ta raqam kiriting.\n<i>Masalan: 998901234567</i>', { parse_mode: 'HTML' });
                    return;
                }
                ses.phone = phone;
                ses.step = 'region';

                // Hududlar ro'yxati
                const points = await prisma.recyclePoint.findMany({ where: { status: 'active' }, orderBy: { regionUz: 'asc' } });
                if (points.length === 0) {
                    arizaSessions.delete(tgId);
                    await ctx.reply('❌ Hozircha aktiv yig\'ish hududlari yo\'q. Keyinroq qayta urinib ko\'ring.');
                    return;
                }

                const regionButtons = points.map(p =>
                    [btn(`📍 ${p.regionUz} — ${p.cityUz}`, `ariza_region_${p.id}`)]
                );
                regionButtons.push([btn('❌ Bekor qilish', 'ariza_cancel')]);

                await ctx.reply(
                    `📍 <b>Hududingizni tanlang:</b>`,
                    { parse_mode: 'HTML', reply_markup: { inline_keyboard: regionButtons } }
                );

                // Hide the normal reply keyboard
                await bot.telegram.sendMessage(ctx.chat.id, 'Davom etish...', { reply_markup: { remove_keyboard: true } }).then(m => bot.telegram.deleteMessage(ctx.chat.id, m.message_id)).catch(() => {});
                return;
            }

            // 3. Og'irlik kiritish
            if (ses.step === 'volume') {
                const vol = parseInt(text.replace(',', '.'));
                ses.volume = isNaN(vol) || vol <= 0 ? 0 : vol;
                ses.step = 'address';

                await ctx.reply(
                    `📦 Material: <b>${MAT[ses.material || 'mix']?.emoji || '📦'} ${MAT[ses.material || 'mix']?.label || ses.material}</b>\n` +
                    `⚖️ Hajm: <b>${ses.volume || 'ko\'rsatilmagan'} kg</b>\n\n` +
                    `🏠 <b>Qanday topshirasiz?</b> 2 ta usul mavjud:\n\n` +
                    `1️⃣ <b>O'zingiz olib kelsangiz:</b> Pulingizni to'liq (100%) olasiz.\n` +
                    `2️⃣ <b>Mashina chaqirsangiz:</b> Yo'l kirasi evaziga narxdan <b>50% ushlab qolinadi</b>.\n\n` +
                    `<i>Qaysi birini tanlaysiz?</i> 👇`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn('🚚 Mashina chaqirish (-50% narx)', 'ariza_pickup')],
                                [btn('🏢 O\'zim olib boraman (To\'liq narx)', 'ariza_base')],
                                [btn('❌ Bekor qilib chiqish', 'ariza_cancel')],
                            ],
                        },
                    }
                );
                return;
            }

            // 4. Manzil kiritish (pickup)
            if (ses.step === 'confirm') {
                const address = text.trim();
                await createArizaFromSession(ctx, tgId, 'pickup', address);
                return;
            }

            // Agar noma'lum step bo'lsa
            arizaSessions.delete(tgId);
        }

        // ── Haydovchi: Og'irlik kiritish (CALC_ state) ──────────────────
        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver?.vehicleInfo?.startsWith('CALC_')) {
            const requestId = parseInt(driver.vehicleInfo.split('_')[1]);
            const weight = parseFloat(text.replace(',', '.'));

            if (isNaN(weight) || weight <= 0) {
                ctx.reply('❌ Noto\'g\'ri format! Faqat raqam kiriting (masalan: 150)');
                return;
            }

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
                ctx.reply('❌ Chegirma 0 dan 50 gacha bo\'lishi kerak!'); return;
            }

            const effectiveWeight = weight - (weight * discount / 100);
            await prisma.driver.update({
                where: { id: driver.id },
                data: { vehicleInfo: `MATERIAL_${requestId}_${weight}_${discount}` },
            });

            const req = await prisma.recycleRequest.findUnique({ where: { id: requestId }, include: { point: true } });
            
            const matButtons = Object.entries(MAT).map(([key, m]) => {
                let p = req?.point?.pricePerKg || m.price;
                if (req?.pickupType === 'pickup') p = p * 0.5;
                return [btn(`${m.emoji} ${m.label} — ${fmtN(p)} so'm/kg`, `mat_${key}_${requestId}`)];
            });

            ctx.reply(
                `📊 <b>Hisob-kitob:</b>\n\n` +
                `⚖️ Og'irlik: <b>${weight} kg</b>\n` +
                `${discount > 0 ? `🏷️ Chegirma: <b>${discount}%</b>\n📊 Hisoblangan: <b>${effectiveWeight.toFixed(1)} kg</b>\n` : ''}` +
                `${req?.pickupType === 'pickup' ? `🚚 <b>Mashina chaqirilgan (-50% narx qo'llanilgan)</b>\n` : ''}` +
                `\n📦 <b>Material turini tanlang:</b>`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: matButtons } }
            );
            return;
        }

        // ── PERSISTENT KEYBOARD TUGMALARI ────────────────────────────────
        // Masul shaxs tugmalari
        if (text === '📋 Arizalar') {
            const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
            if (sup) {
                const reqs = await prisma.recycleRequest.findMany({
                    where: { supervisorId: sup.id, status: { in: ['new', 'dispatched', 'assigned', 'en_route', 'arrived', 'collecting'] } },
                    include: { point: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                });
                if (reqs.length === 0) { await ctx.reply('📋 Hozircha aktiv arizalar yo\'q.'); return; }
                for (const r of reqs) {
                    await ctx.reply(
                        `📋 <b>Ariza #${r.id}</b>\n` +
                        `👤 ${r.name || '—'} | 📞 ${r.phone || '—'}\n` +
                        `📍 ${r.point?.regionUz || '—'} | ${getStatusLabel(r.status)}`,
                        { parse_mode: 'HTML' }
                    );
                }
            } else {
                await ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.');
            }
            return;
        }
        if (text === '🚚 Haydovchilar') {
            const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
            if (sup) {
                const drvs = await prisma.driver.findMany({ where: { supervisorId: sup.id }, orderBy: { name: 'asc' } });
                if (drvs.length === 0) { await ctx.reply('🚚 Sizda haydovchilar yo\'q.'); return; }
                const lines = drvs.map(d =>
                    `${d.isOnline ? '🟢' : '🔴'} <b>${d.name}</b> — ${d.phone || '—'} — ${d.status || 'active'}`
                ).join('\n');
                await ctx.reply(`🚚 <b>Haydovchilar (${drvs.length}):</b>\n\n${lines}`, { parse_mode: 'HTML' });
            } else {
                await ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.');
            }
            return;
        }
        if (text === '📊 Hisobot') {
            // /hisobot buyrug'ini ishlatish uchun
            await ctx.reply('📊 /hisobot buyrug\'i orqali ko\'ring.');
            return;
        }
        if (text === '💰 To\'lovlar') {
            await ctx.reply('💰 /tolash buyrug\'i orqali ko\'ring.');
            return;
        }
        if (text === '📋 Ishlarim') {
            const drv = await prisma.driver.findUnique({ where: { telegramId: tgId } });
            if (drv) {
                const jobs = await prisma.recycleRequest.findMany({
                    where: { assignedDriverId: drv.id, status: { in: ['assigned', 'en_route', 'arrived', 'collecting'] } },
                    include: { point: true },
                    orderBy: { createdAt: 'desc' },
                });
                if (jobs.length === 0) { await ctx.reply('📋 Hozircha ish yo\'q. Kuting...'); return; }
                for (const r of jobs) {
                    await ctx.reply(
                        `📋 <b>Ish #${r.id}</b>\n` +
                        `👤 ${r.name || '—'} | 📞 ${r.phone || '—'}\n` +
                        `📍 ${r.address || '—'}\n` +
                        `📊 ${getStatusLabel(r.status)}`,
                        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
                            r.status === 'assigned' ? [btn('🚚 Yo\'lga chiqdim', `en_route_${r.id}`)] :
                            r.status === 'en_route' ? [btn('📍 Yetib keldim', `arrived_${r.id}`)] :
                            r.status === 'arrived' ? [btn('📦 Yig\'ish boshlash', `collecting_${r.id}`)] :
                            [],
                        ] } }
                    );
                }
            } else {
                await ctx.reply('❌ Siz haydovchi sifatida ro\'yxatga olinmagansiz.');
            }
            return;
        }
        if (text === '🔄 Status') {
            const drv = await prisma.driver.findUnique({ where: { telegramId: tgId } });
            if (drv) {
                const newStatus = !drv.isOnline;
                await prisma.driver.update({ where: { id: drv.id }, data: { isOnline: newStatus, lastSeenAt: new Date() } });
                await ctx.reply(`${newStatus ? '🟢 Online' : '🔴 Offline'} holatga o'tdingiz.`);
            } else {
                await ctx.reply('❌ Siz haydovchi sifatida ro\'yxatga olinmagansiz.');
            }
            return;
        }
        if (text === '📋 Arizalarim') {
            const reqs = await prisma.recycleRequest.findMany({
                where: { customerTgId: tgId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { point: true },
            });
            if (reqs.length === 0) { await ctx.reply('📋 Sizda hali ariza yo\'q.\n\n♻️ /ariza orqali yangi ariza yuboring!'); return; }
            const list = reqs.map(r =>
                `${getStatusLabel(r.status)} <b>#${r.id}</b> — ${r.point?.regionUz || '—'} — ${new Date(r.createdAt).toLocaleDateString('ru-RU')}`
            ).join('\n');
            await ctx.reply(
                `📋 <b>Arizalaringiz:</b>\n\n${list}`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Buyurtmalarim tugmasi
        if (text === '📦 Buyurtmalarim') {
            const tgUser = await prisma.order.findMany({
                where: { telegramUserId: tgId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, totalAmount: true, status: true, createdAt: true },
            });
            if (tgUser.length === 0) {
                await ctx.reply('📦 Sizda hali buyurtma yo\'q.\n\nBuyurtma berish uchun 🏪 Pack24 do\'koniga kiring!');
                return;
            }
            const statusMap: Record<string, string> = {
                new: '🔵', processing: '🟡', shipping: '🚚', delivered: '✅', cancelled: '🔴', draft: '⚪',
            };
            const list = tgUser.map(o =>
                `${statusMap[o.status] || '⚪'} <b>#${o.id}</b> — ${fmtN(o.totalAmount || 0)} so'm — ${new Date(o.createdAt).toLocaleDateString('ru-RU')}`
            ).join('\n');
            await ctx.reply(
                `📦 <b>So'nggi buyurtmalaringiz:</b>\n\n${list}\n\n` +
                `Batafsil: /buyurtma [raqam]\n<i>Masalan: /buyurtma ${tgUser[0].id}</i>`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Aloqa tugmasi
        if (text === '📞 Aloqa') {
            await ctx.reply(
                `📞 <b>Pack24 — Aloqa ma'lumotlari</b>\n\n` +
                `📱 Telefon: <b>+998 88 055-78-88</b>\n` +
                `📧 Email: <b>sales@pack24.uz</b>\n` +
                `🌐 Sayt: <b>pack24.uz</b>\n` +
                `📍 Manzil: <b>Toshkent shahri</b>\n\n` +
                `⏰ Ish vaqti: <b>8:00 — 21:00</b> (har kuni)`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // ── SHIKOYAT FLOW: matn qabul qilish ────────────────────────────
        const complaint = complaintSessions.get(tgId);
        if (complaint) {
            const complaintText = text.trim();
            if (complaintText.length < 5) {
                await ctx.reply('⚠️ Shikoyat matni kamida 5 ta belgidan iborat bo\'lishi kerak.');
                return;
            }

            try {
                const req = await prisma.recycleRequest.findUnique({
                    where: { id: complaint.requestId },
                    include: { supervisor: true },
                });

                complaintSessions.delete(tgId);

                await ctx.reply(
                    `✅ <b>Shikoyat qabul qilindi!</b>\n\n` +
                    `📋 Ariza: #${complaint.requestId}\n` +
                    `📝 ${complaintText.slice(0, 100)}${complaintText.length > 100 ? '...' : ''}\n\n` +
                    `${complaint.level === 'director' ? '🏢 Direktorsiyaga' : '👷 Masul shaxsga'} yo'naltirildi.\n` +
                    `Tez orada javob beriladi.`,
                    { parse_mode: 'HTML' }
                );

                // Masulga/adminga xabar
                if (complaint.level === 'supervisor' && req?.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `⚠️ <b>Yangi shikoyat!</b>\n\n` +
                        `📋 Ariza: #${complaint.requestId}\n` +
                        `👤 ${ctx.from.first_name || 'Mijoz'}\n` +
                        `📝 ${complaintText.slice(0, 200)}`,
                        { parse_mode: 'HTML' }
                    );
                }

                // Admin guruhga ham yuborish
                const config2 = await prisma.telegramConfig.findFirst();
                if (config2?.salesChatId) {
                    const chatIds = config2.salesChatId.split(',').map(id => id.trim());
                    for (const chatId of chatIds) {
                        if (chatId) {
                            try {
                                await bot.telegram.sendMessage(chatId,
                                    `⚠️ <b>${complaint.level === 'director' ? '🏢 DIREKTOR' : '👷 MASUL'}GA SHIKOYAT</b>\n\n` +
                                    `📋 Ariza: #${complaint.requestId}\n` +
                                    `👤 ${ctx.from.first_name || 'Mijoz'}\n` +
                                    `📝 ${complaintText.slice(0, 200)}`,
                                    { parse_mode: 'HTML' }
                                );
                            } catch {}
                        }
                    }
                }
            } catch (error) {
                console.error('Shikoyat saqlashda xato:', error);
                complaintSessions.delete(tgId);
                await ctx.reply('❌ Shikoyat yuborishda xatolik. Qayta /shikoyat yuboring.');
            }
            return;
        }
    });

    // ─── /hisobot — Haydovchi yoki Masul uchun moliyaviy hisobot ───────────────
    bot.command('hisobot', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const from30 = new Date(); from30.setDate(from30.getDate() - 30);

        const driver = await prisma.driver.findUnique({ where: { telegramId: tgId } });
        if (driver) {
            const cols = await prisma.recycleCollection.findMany({
                where: { driverId: driver.id, createdAt: { gte: from30 } },
                orderBy: { createdAt: 'desc' },
            });
            if (cols.length === 0) { ctx.reply('📊 Oxirgi 30 kunda yig\'ish yo\'q.'); return; }
            const totalAmt = cols.reduce((s, c) => s + c.totalAmount, 0);
            const totalKg  = cols.reduce((s, c) => s + c.actualWeight, 0);
            const paid = cols.filter(c => c.paymentStatus !== 'pending').length;
            const details = cols.slice(0, 5).map((c, i) =>
                `${i + 1}. #${c.requestId} — ${c.actualWeight}kg → ${fmtN(c.totalAmount)} so'm ${c.paymentStatus === 'pending' ? '⏳' : '✅'}`
            ).join('\n');
            ctx.reply(
                `📊 <b>Hisobotingiz (30 kun)</b>\n\n` +
                `📦 Yig'ishlar: <b>${cols.length}</b>\n` +
                `⚖️ Jami: <b>${totalKg.toFixed(1)} kg</b>\n` +
                `💵 Summa: <b>${fmtN(totalAmt)} so'm</b>\n` +
                `✅ To'langan: <b>${paid}/${cols.length}</b>\n\n` +
                `<b>Oxirgi 5 ta:</b>\n${details}`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (sup) {
            const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
            const dIds = drivers.map(d => d.id);
            const cols = await prisma.recycleCollection.findMany({
                where: { driverId: { in: dIds }, createdAt: { gte: from30 } },
                include: { driver: true },
            });
            const totalAmt = cols.reduce((s, c) => s + c.totalAmount, 0);
            const totalKg  = cols.reduce((s, c) => s + c.actualWeight, 0);
            const pending  = cols.filter(c => c.paymentStatus === 'pending').length;
            const byDrv = drivers.map(d => {
                const dc = cols.filter(c => c.driverId === d.id);
                return { name: d.name, count: dc.length, kg: dc.reduce((s, c) => s + c.actualWeight, 0), amt: dc.reduce((s, c) => s + c.totalAmount, 0) };
            }).filter(d => d.count > 0);
            const drvLines = byDrv.map(d => `🚚 ${d.name}: ${d.count} ta | ${d.kg.toFixed(0)} kg | ${fmtN(d.amt)} so'm`).join('\n');
            ctx.reply(
                `📊 <b>Jamoaviy hisobot (30 kun)</b>\n\n` +
                `📦 Jami: <b>${cols.length}</b>  ⚖️ <b>${totalKg.toFixed(1)} kg</b>\n` +
                `💵 Summa: <b>${fmtN(totalAmt)} so'm</b>\n` +
                `⏳ To'lanmagan: <b>${pending} ta</b>\n\n` +
                `<b>Haydovchilar:</b>\n${drvLines || 'Yig\'ish yo\'q'}`,
                { parse_mode: 'HTML' }
            );
            return;
        }
        ctx.reply('❌ Siz tizimda ro\'yxatga olinmagansiz.');
    });

    // ─── /tolash — Masul uchun kutilayotgan to'lovlar ────────────────────────────
    bot.command('tolash', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const sup = await prisma.supervisor.findUnique({ where: { telegramId: tgId } });
        if (!sup) { ctx.reply('❌ Siz masul sifatida ro\'yxatga olinmagansiz.'); return; }

        const drivers = await prisma.driver.findMany({ where: { supervisorId: sup.id } });
        const dIds = drivers.map(d => d.id);
        const pending = await prisma.recycleCollection.findMany({
            where: { driverId: { in: dIds }, paymentStatus: 'pending', customerConfirmed: true },
            include: { request: { include: { point: true } }, driver: true },
            orderBy: { createdAt: 'desc' }, take: 10,
        });

        if (pending.length === 0) { ctx.reply('✅ To\'lanmagan (tasdiqlangan) yig\'ishlar yo\'q.'); return; }

        for (const coll of pending) {
            await ctx.reply(
                `💰 <b>To'lov kerak — Ariza #${coll.requestId}</b>\n\n` +
                `👤 ${coll.request.name} | ${coll.request.phone}\n` +
                `🚚 Haydovchi: ${coll.driver.name}\n` +
                `⚖️ Og'irlik: ${coll.actualWeight} kg\n` +
                `💵 Summa: <b>${fmtN(coll.totalAmount)} so'm</b>`,
                { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
                    [btn(`💵 Mijozga to'lash`, `pay_cust_${coll.id}`)],
                    [btn(`🚚 Haydovchiga to'lash (10%)`, `pay_drv_${coll.id}`)],
                    [btn(`💰 Ikkalasiga to'lash`, `pay_both_${coll.id}`)],
                ] } }
            );
        }
    });

    // ─── /shikoyat — Mijoz shikoyat qoldiradi ──────────────────────────────────
    bot.command('shikoyat', async (ctx) => {
        const tgId = ctx.from.id.toString();

        // Mijozning arizalarini topish
        const reqs = await prisma.recycleRequest.findMany({
            where: { customerTgId: tgId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { point: true },
        });

        if (reqs.length === 0) {
            await ctx.reply('⚠️ Sizda arizalar yo\'q — avval /ariza yuboring.');
            return;
        }

        // Ariza tanlash uchun inline tugmalar
        const buttons = reqs.map(r => [
            btn(`#${r.id} — ${r.point?.regionUz || 'Noma\'lum'} — ${getStatusLabel(r.status)}`, `complaint_${r.id}`)
        ]);
        buttons.push([btn('❌ Bekor qilish', 'complaint_cancel')]);

        await ctx.reply(
            `⚠️ <b>Shikoyat qoldirish</b>\n\n` +
            `Qaysi ariza bo'yicha shikoyat qilmoqchisiz?\nTanlang:`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }
        );
    });

    // ─── /narxlar — Material narxlari ─────────────────────────────────────────
    bot.command('narxlar', async (ctx) => {
        const lines = Object.values(MAT).map(m => `${m.emoji} ${m.label}: <b>${fmtN(m.price)} so'm/kg</b>`).join('\n');
        await ctx.reply(
            `💰 <b>Material narxlari:</b>\n\n${lines}\n\n` +
            `<i>Narxlar o'zgarishi mumkin. Aniq narx yig'ish vaqtida belgilanadi.</i>\n\n` +
            `♻️ Makulatura topshirish: /ariza`,
            { parse_mode: 'HTML' }
        );
    });

    // ─── /buyurtma — Pack24 buyurtmasini kuzatish ────────────────────────────
    bot.command('buyurtma', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2 || isNaN(parseInt(args[1]))) {
            await ctx.reply(
                `📦 <b>Buyurtmani kuzatish</b>\n\n` +
                `Buyurtma raqamini yozing:\n<i>Masalan: /buyurtma 123</i>\n\n` +
                `Yoki quyidagi tugmani bosing:`,
                {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [
                        [btn('📋 So\'nggi buyurtmalarim', 'my_orders')],
                    ] },
                }
            );
            return;
        }

        const orderId = parseInt(args[1]);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: { select: { name: true, price: true } } } } },
        });
        if (!order) { await ctx.reply(`❌ Buyurtma #${orderId} topilmadi.`); return; }

        const statusMap: Record<string, string> = {
            new: '🔵 Yangi', processing: '🟡 Jarayonda', shipping: '🚚 Yo\'lda',
            delivered: '✅ Yetkazildi', cancelled: '🔴 Bekor', draft: '⚪ Qoralama',
        };
        const items = order.items.map((it: any) =>
            `  • ${it.product?.name || 'Mahsulot'} × ${it.quantity} = ${fmtN(it.price * it.quantity)} so'm`
        ).join('\n');

        await ctx.reply(
            `📦 <b>Buyurtma #${order.id}</b>\n\n` +
            `📊 Status: ${statusMap[order.status] || order.status}\n` +
            `👤 ${order.customerName || '—'} | 📞 ${order.contactPhone || '—'}\n` +
            `📍 ${order.shippingAddress || '—'}\n\n` +
            `<b>Mahsulotlar:</b>\n${items || 'Mahsulotlar yo\'q'}\n\n` +
            `💵 <b>Jami: ${fmtN(order.totalAmount || 0)} so'm</b>\n` +
            `📅 ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`,
            { parse_mode: 'HTML' }
        );
    });

    // Help
    bot.help((ctx) => {
        ctx.reply(
            `📋 <b>Pack24 Bot — Buyruqlar</b>\n\n` +
            `<b>👤 Mijoz:</b>\n` +
            `/ariza — ♻️ Makulatura topshirish\n` +
            `/arizalarim — Arizalarim holati\n` +
            `/buyurtma — 📦 Buyurtma kuzatish\n` +
            `/narxlar — 💰 Material narxlari\n` +
            `/shikoyat — ⚠️ Shikoyat qoldirish\n\n` +
            `<b>👷 Masul shaxs:</b>\n` +
            `/arizalar — Aktiv arizalar\n` +
            `/haydovchilar — Haydovchilar ro'yxati\n` +
            `/hisobot — Moliyaviy hisobot (30 kun)\n` +
            `/tolash — Kutilayotgan to'lovlar\n\n` +
            `<b>🚚 Haydovchi:</b>\n` +
            `/ishlarim — Tayinlangan ishlar\n` +
            `/status — Online/Offline\n` +
            `/hisobot — Mening hisobotim\n\n` +
            `<b>📱 Boshqa:</b>\n` +
            `/start — Bosh menyu`,
            { parse_mode: 'HTML' }
        );
    });

    botInstance = bot;
    return bot;
};

// ─── Ariza yaratish helper ──────────────────────────────────────────────────
async function createArizaFromSession(ctx: Context, tgId: string, pickupType: string, address: string | null) {
    const ses = arizaSessions.get(tgId);
    if (!ses || !ses.name || !ses.phone || !ses.regionId) {
        arizaSessions.delete(tgId);
        await ctx.reply('❌ Sessiya tugagan. Qayta /ariza yuboring.');
        return;
    }

    try {
        const point = await prisma.recyclePoint.findUnique({ where: { id: ses.regionId } });
        const matInfo = MAT[ses.material || 'mix'] || MAT.mix;

        const request = await prisma.recycleRequest.create({
            data: {
                name: ses.name,
                phone: ses.phone,
                regionId: ses.regionId,
                material: ses.material || 'mix',
                volume: ses.volume || null,
                pickupType,
                address: address || null,
                customerTgId: tgId,
                status: 'new',
            },
        });

        arizaSessions.delete(tgId);

        await ctx.reply(
            `✅ <b>Ariza yuborildi! #${request.id}</b>\n\n` +
            `👤 ${ses.name} | 📞 ${ses.phone}\n` +
            `📍 ${point?.regionUz || '—'}, ${point?.cityUz || '—'}\n` +
            `${matInfo.emoji} ${matInfo.label}` +
            `${ses.volume ? ` | ⚖️ ~${ses.volume} kg` : ''}\n` +
            `🏠 ${pickupType === 'pickup' ? `Pickup: ${address}` : "O'zi olib boradi"}\n\n` +
            `⏳ Tez orada masul shaxs siz bilan bog'lanadi!\n` +
            `Holat: /arizalarim`,
            { parse_mode: 'HTML' }
        );

        // ── Masul shaxslarga xabar ────────────────────────────────────────
        const supervisors = await prisma.supervisor.findMany({
            where: { pointId: ses.regionId, isActive: true },
        });
        const bot = botInstance;
        if (bot) {
            for (const sup of supervisors) {
                if (sup.telegramId) {
                    try {
                        await bot.telegram.sendMessage(sup.telegramId,
                            `📬 <b>Yangi ariza! #${request.id}</b>\n\n` +
                            `👤 ${ses.name} | 📞 ${ses.phone}\n` +
                            `📍 ${point?.regionUz || '—'}\n` +
                            `${matInfo.emoji} ${matInfo.label}` +
                            `${ses.volume ? ` | ⚖️ ~${ses.volume} kg` : ''}\n` +
                            `🏠 ${pickupType === 'pickup' ? `Pickup: ${address}` : "O'zi keladi"}\n\n` +
                            `Haydovchi tayinlash uchun /arizalar`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (e) {
                        console.error(`Supervisorga xabar yuborishda xato (${sup.id}):`, e);
                    }
                }
            }
        }

        // ── Admin guruhga xabar ───────────────────────────────────────────
        const config = await prisma.telegramConfig.findFirst();
        if (config?.salesChatId && bot) {
            const chatIds = config.salesChatId.split(',').map(id => id.trim());
            for (const chatId of chatIds) {
                if (chatId) {
                    try {
                        await bot.telegram.sendMessage(chatId,
                            `📬 <b>Yangi ariza! #${request.id}</b>\n👤 ${ses.name} | 📞 ${ses.phone}\n📍 ${point?.regionUz || '—'}\n${matInfo.emoji} ${matInfo.label}`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (e) {
                        console.error(`Admin chatga xabar yuborishda xato (${chatId}):`, e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Ariza yaratishda xato:', error);
        arizaSessions.delete(tgId);
        await ctx.reply('❌ Ariza yaratishda xatolik yuz berdi. Qayta /ariza yuboring.');
    }
}

// ─── Reset ──────────────────────────────────────────────────────────────────
export const resetBot = () => {
    if (botInstance) {
        try { botInstance.stop('reset'); } catch {}
    }
    botInstance = null;
    pollingStarted = false;
};

// ─── Polling rejim (development uchun — webhook kerak emas) ─────────────────
let pollingStarted = false;

export const startPolling = async () => {
    if (pollingStarted) return;
    const bot = await getBot();
    if (!bot) {
        console.warn('[Bot] Token sozlanmagan — polling boshlanmadi');
        return;
    }

    try {
        // Avval webhook ni o'chirish
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('🤖 Webhook o\'chirildi, polling boshlanmoqda...');
    } catch (e) {
        console.error('Webhook o\'chirishda xato:', e);
    }

    pollingStarted = true;
    bot.launch({ dropPendingUpdates: true })
        .then(() => console.log('🤖 Bot polling rejimda ishga tushdi!'))
        .catch((err) => {
            console.error('Bot polling xatosi:', err);
            pollingStarted = false;
        });

    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

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
