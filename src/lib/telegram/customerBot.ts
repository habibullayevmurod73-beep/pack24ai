import { Telegraf, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { Lang, getText, formatText } from './i18n';
import { haversineDistance } from './geo';
import { notifyAdmin } from './notifier';

// ─── Material narxlari (so'm/kg) ─────────────────────────────────────────────
const MAT: Record<string, { label: Record<Lang, string>; emoji: string; price: number }> = {
    qogoz:   { label: { uz: "Qog'oz (rangsiz)", ru: 'Бумага (белая)', en: 'Paper (white)' }, emoji: '📄', price: 600 },
    karton:  { label: { uz: 'Karton', ru: 'Картон', en: 'Cardboard' }, emoji: '📦', price: 700 },
    plastik: { label: { uz: 'Plastik', ru: 'Пластик', en: 'Plastic' }, emoji: '🧴', price: 1000 },
    temir:   { label: { uz: 'Temir/Metallar', ru: 'Металлы', en: 'Metals' }, emoji: '🔩', price: 2000 },
    shisha:  { label: { uz: 'Shisha', ru: 'Стекло', en: 'Glass' }, emoji: '🫙', price: 300 },
    gazeta:  { label: { uz: 'Gazeta', ru: 'Газета', en: 'Newspaper' }, emoji: '📰', price: 400 },
    mix:     { label: { uz: 'Aralash', ru: 'Смешанное', en: 'Mixed' }, emoji: '🗑️', price: 500 },
};

const fmtN = (n: number) => n.toLocaleString('ru-RU');

// ─── Session types ────────────────────────────────────────────────────────────
interface CustomerSession {
    step: 'lang' | 'name' | 'phone' | 'menu' | 'location' | 'choose_method' | 'volume' | 'photo' | 'done';
    lang: Lang;
    name?: string;
    phone?: string;
    lat?: number;
    lng?: number;
    pickupType?: 'base' | 'pickup';
    volumeSize?: string;
}

const sessions = new Map<string, CustomerSession>();
const registrationSessions = new Set<string>();

// ─── Inline button helper ─────────────────────────────────────────────────────
function btn(text: string, data: string) {
    return { text, callback_data: data };
}

// ─── Mijoz til olish ─────────────────────────────────────────────────────────
async function getUserLang(tgId: string): Promise<Lang> {
    // So'nggi arizadan tilni olish
    const req = await prisma.recycleRequest.findFirst({
        where: { customerTgId: tgId },
        orderBy: { createdAt: 'desc' },
        select: { customerLang: true },
    });
    return (req?.customerLang as Lang) || 'uz';
}

// ─── Bosh menyu klaviaturasi ──────────────────────────────────────────────────
function mainKeyboard(lang: Lang) {
    return {
        keyboard: [
            [{ text: getText('btn_catalog', lang) }, { text: getText('btn_recycle', lang) }],
            [{ text: getText('btn_ai', lang) }, { text: getText('btn_contact', lang) }],
            [{ text: getText('btn_my_requests', lang) }, { text: getText('btn_settings', lang) }],
        ],
        resize_keyboard: true,
    };
}

// ─── Customer Bot init ────────────────────────────────────────────────────────
let customerBotInstance: Telegraf | null = null;

export async function initCustomerBot(): Promise<Telegraf | null> {
    if (customerBotInstance) return customerBotInstance;

    const config = await prisma.telegramConfig.findFirst();
    if (!config?.botToken) {
        console.warn('[CustomerBot] Token topilmadi');
        return null;
    }

    const bot = new Telegraf(config.botToken);

    // ─── Commands menu ────────────────────────────────────────────────────
    await bot.telegram.setMyCommands([
        { command: 'start', description: '🏠 Bosh menyu / Главное меню / Main menu' },
        { command: 'help', description: '❓ Yordam / Помощь / Help' },
    ]).catch(() => {});

    // Middleware — log
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        console.log(`[CustomerBot] ${ctx.updateType} in ${Date.now() - start}ms`);
    });

    // ══════════════════════════════════════════════════════════════════════
    // /start — Tilni tanlash yoki bosh menyu
    // ══════════════════════════════════════════════════════════════════════
    bot.start(async (ctx) => {
        const tgId = ctx.from.id.toString();

        // Qaytgan foydalanuvchini tekshirish
        const existingReq = await prisma.recycleRequest.findFirst({
            where: { customerTgId: tgId },
            orderBy: { createdAt: 'desc' },
        });

        if (existingReq) {
            const lang = (existingReq.customerLang as Lang) || 'uz';
            const name = existingReq.name || ctx.from.first_name;
            await ctx.reply(
                `🏭 <b>Pack24</b>\n\n` +
                (lang === 'uz' ? `Salom, <b>${name}</b>! Xush kelibsiz qaytadan 👋` :
                 lang === 'ru' ? `Привет, <b>${name}</b>! Добро пожаловать обратно 👋` :
                 `Hello, <b>${name}</b>! Welcome back 👋`),
                { parse_mode: 'HTML', reply_markup: mainKeyboard(lang) }
            );
            return;
        }

        // Yangi foydalanuvchi — til tanlash
        sessions.set(tgId, { step: 'lang', lang: 'uz' });
        await ctx.reply(
            getText('welcome', 'uz'),
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn('🇺🇿 O\'zbekcha', 'lang_uz')],
                        [btn('🇷🇺 Русский', 'lang_ru')],
                        [btn('🇬🇧 English', 'lang_en')],
                    ],
                },
            }
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
            // ── TIL TANLASH ─────────────────────────────────────────────
            if (data.startsWith('lang_')) {
                const lang = data.replace('lang_', '') as Lang;
                const ses = sessions.get(tgId) || { step: 'lang' as const, lang };
                ses.lang = lang;
                ses.step = 'name';
                sessions.set(tgId, ses);

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    getText('register_name', lang),
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // ── RO'YXATDAN O'TISH (xodim kodi) ─────────────────────────
            if (data === 'register_code') {
                registrationSessions.add(tgId);
                const lang = (sessions.get(tgId)?.lang) || await getUserLang(tgId) || 'uz';
                await ctx.answerCbQuery('🔑');
                await ctx.editMessageText(
                    lang === 'uz' ? '🔑 <b>Kod bilan ro\'yxatdan o\'tish</b>\n\nAdmin sizga bergan <b>5 raqamli kodni</b> kiriting:\n<i>Masalan: 48271</i>' :
                    lang === 'ru' ? '🔑 <b>Вход по коду</b>\n\nВведите <b>5-значный код</b>, выданный администратором:\n<i>Например: 48271</i>' :
                    '🔑 <b>Login with code</b>\n\nEnter the <b>5-digit code</b> given by admin:\n<i>Example: 48271</i>',
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: [[btn('❌', 'register_cancel')]] },
                    }
                );
                return;
            }

            if (data === 'register_cancel') {
                registrationSessions.delete(tgId);
                await ctx.answerCbQuery('❌');
                await ctx.editMessageText('❌ /start');
                return;
            }

            // ── MAKULATURA XIZMATI: usul tanlash ────────────────────────
            if (data === 'recycle_self') {
                const ses = sessions.get(tgId);
                if (!ses?.lat || !ses?.lng) return;
                ses.pickupType = 'base';
                ses.step = 'done';

                await ctx.answerCbQuery('🏭');

                // Eng yaqin punkt hisoblash
                const points = await prisma.recyclePoint.findMany({
                    where: { status: 'active' },
                    include: { supervisors: { where: { isActive: true }, take: 1 } },
                });

                if (points.length === 0) {
                    const lang = ses.lang;
                    await ctx.editMessageText(
                        lang === 'uz' ? '❌ Hozircha aktiv yig\'ish punktlari yo\'q.' :
                        lang === 'ru' ? '❌ Пока нет активных пунктов приёма.' :
                        '❌ No active collection points available.',
                        { parse_mode: 'HTML' }
                    );
                    sessions.delete(tgId);
                    return;
                }

                const pointsWithDist = points.map(p => ({
                    ...p,
                    distance: (p.lat && p.lng) ? haversineDistance(ses.lat!, ses.lng!, p.lat, p.lng) : 9999,
                })).sort((a, b) => a.distance - b.distance);

                const nearest = pointsWithDist[0];
                const sup = nearest.supervisors[0];
                const lang = ses.lang;

                const statusText = nearest.isAccepting
                    ? getText('point_open', lang)
                    : getText('point_closed', lang);

                const pricesText = Object.entries(MAT).map(([, m]) =>
                    `  ${m.emoji} ${m.label[lang]}: <b>${fmtN(m.price)} so'm/kg</b>`
                ).join('\n');

                const info = formatText('nearest_point', lang, {
                    name: nearest.regionUz,
                    distance: String(nearest.distance),
                    schedule: nearest.workingHours || '08:00-18:00',
                    status: statusText,
                    prices: pricesText,
                    supervisor: sup?.name || '—',
                    phone: sup?.phone || '—',
                    telegram: sup?.telegramName || '—',
                });

                await ctx.editMessageText(info, { parse_mode: 'HTML' });

                // Lokatsiyani yuborish
                if (nearest.lat && nearest.lng) {
                    await ctx.reply('📍', {
                        reply_markup: { remove_keyboard: true },
                    });
                    await bot.telegram.sendLocation(ctx.chat!.id, nearest.lat, nearest.lng);
                }

                // Agar yopiq bo'lsa — keyingi eng yaqinini taklif qilish
                if (!nearest.isAccepting && pointsWithDist.length > 1) {
                    const next = pointsWithDist.find(p => p.id !== nearest.id && p.isAccepting);
                    if (next) {
                        const nextMsg = lang === 'uz'
                            ? `💡 Eng yaqin <b>ochiq</b> punkt: <b>${next.regionUz}</b> (~${next.distance} km)`
                            : lang === 'ru'
                            ? `💡 Ближайший <b>открытый</b> пункт: <b>${next.regionUz}</b> (~${next.distance} км)`
                            : `💡 Nearest <b>open</b> point: <b>${next.regionUz}</b> (~${next.distance} km)`;
                        await ctx.reply(nextMsg, { parse_mode: 'HTML' });
                    }
                }

                sessions.delete(tgId);
                return;
            }

            // ── MASHINA CHAQIRISH: boshlash ─────────────────────────────
            if (data === 'recycle_truck') {
                const ses = sessions.get(tgId);
                if (!ses?.lat || !ses?.lng) return;
                ses.pickupType = 'pickup';
                ses.step = 'volume';

                await ctx.answerCbQuery('🚛');
                const lang = ses.lang;
                await ctx.editMessageText(
                    getText('truck_volume', lang),
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn(getText('vol_small', lang), 'vol_small')],
                                [btn(getText('vol_medium', lang), 'vol_medium')],
                                [btn(getText('vol_large', lang), 'vol_large')],
                                [btn(getText('cancel', lang), 'recycle_cancel')],
                            ],
                        },
                    }
                );
                return;
            }

            // ── HAJM TANLASH ────────────────────────────────────────────
            if (data.startsWith('vol_')) {
                const ses = sessions.get(tgId);
                if (!ses || ses.step !== 'volume') return;
                ses.volumeSize = data.replace('vol_', '');
                ses.step = 'photo';
                const lang = ses.lang;

                await ctx.answerCbQuery('✅');
                await ctx.editMessageText(
                    getText('truck_photo', lang),
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [btn(getText('btn_skip_photo', lang), 'skip_photo')],
                                [btn(getText('cancel', lang), 'recycle_cancel')],
                            ],
                        },
                    }
                );
                return;
            }

            // ── RASMNI O'TKAZIB YUBORISH ────────────────────────────────
            if (data === 'skip_photo') {
                const ses = sessions.get(tgId);
                if (!ses) return;
                await submitTruckRequest(ctx, bot, ses, tgId);
                return;
            }

            // ── BEKOR QILISH ────────────────────────────────────────────
            if (data === 'recycle_cancel') {
                sessions.delete(tgId);
                const lang = await getUserLang(tgId);
                await ctx.answerCbQuery('❌');
                await ctx.editMessageText(
                    lang === 'uz' ? '❌ Bekor qilindi.' : lang === 'ru' ? '❌ Отменено.' : '❌ Cancelled.'
                );
                return;
            }

        } catch (err) {
            console.error('[CustomerBot] Callback error:', err);
            await ctx.answerCbQuery('❌ Xatolik').catch(() => {});
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // CONTACT HANDLER
    // ══════════════════════════════════════════════════════════════════════
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const ses = sessions.get(tgId);
        if (ses?.step === 'phone') {
            ses.phone = ctx.message.contact.phone_number;
            ses.step = 'menu';
            await ctx.reply(
                getText('register_success', ses.lang),
                { parse_mode: 'HTML', reply_markup: mainKeyboard(ses.lang) }
            );

            // Inline tugma — xodim uchun
            await ctx.reply(
                getText('register_code_btn', ses.lang),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[btn(getText('register_code_btn', ses.lang), 'register_code')]],
                    },
                }
            );
            sessions.delete(tgId);
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // LOCATION HANDLER
    // ══════════════════════════════════════════════════════════════════════
    bot.on('location', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const ses = sessions.get(tgId);
        if (!ses || ses.step !== 'location') return;

        ses.lat = ctx.message.location.latitude;
        ses.lng = ctx.message.location.longitude;
        ses.step = 'choose_method';
        const lang = ses.lang;

        await ctx.reply(
            getText('recycle_choose', lang),
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [btn(getText('btn_self_delivery', lang), 'recycle_self')],
                        [btn(getText('btn_call_truck', lang), 'recycle_truck')],
                        [btn(getText('cancel', lang), 'recycle_cancel')],
                    ],
                },
            }
        );
    });

    // ══════════════════════════════════════════════════════════════════════
    // PHOTO HANDLER (mashina chaqirishda rasm)
    // ══════════════════════════════════════════════════════════════════════
    bot.on('photo', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const ses = sessions.get(tgId);
        if (!ses || ses.step !== 'photo') return;

        // Eng katta o'lchamdagi rasmni olish
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const fileLink = await bot.telegram.getFileLink(photo.file_id);

        await submitTruckRequest(ctx, bot, ses, tgId, fileLink.href);
    });

    // ══════════════════════════════════════════════════════════════════════
    // TEXT HANDLER
    // ══════════════════════════════════════════════════════════════════════
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (text.startsWith('/')) return;

        // ── Xodim kodi ──────────────────────────────────────────────
        if (registrationSessions.has(tgId)) {
            await handleRegistrationCode(ctx, tgId, text.trim());
            return;
        }

        // ── Session: ism kiritish ───────────────────────────────────
        const ses = sessions.get(tgId);
        if (ses?.step === 'name') {
            ses.name = text.trim();
            ses.step = 'phone';
            const lang = ses.lang;
            await ctx.reply(
                getText('register_phone', lang),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            [{ text: getText('share_contact', lang), request_contact: true }],
                            [{ text: getText('cancel', lang) }],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                }
            );
            return;
        }

        if (ses?.step === 'phone') {
            const phone = text.replace(/[^0-9+]/g, '');
            if (phone.length < 9) {
                await ctx.reply('❌ Min 9 ta raqam!');
                return;
            }
            ses.phone = phone;
            ses.step = 'menu';
            await ctx.reply(getText('register_success', ses.lang), {
                parse_mode: 'HTML',
                reply_markup: mainKeyboard(ses.lang),
            });
            await ctx.reply(
                ses.lang === 'uz' ? '👇 Xodim bo\'lsangiz:' : ses.lang === 'ru' ? '👇 Если вы сотрудник:' : '👇 If you are staff:',
                { reply_markup: { inline_keyboard: [[btn(getText('register_code_btn', ses.lang), 'register_code')]] } }
            );
            sessions.delete(tgId);
            return;
        }

        // ── Menyu tugmalari ─────────────────────────────────────────
        const lang = await getUserLang(tgId);

        // ♻️ Makulatura xizmati
        if (text === getText('btn_recycle', lang) || text === getText('btn_recycle', 'uz') || text === getText('btn_recycle', 'ru') || text === getText('btn_recycle', 'en')) {
            sessions.set(tgId, { step: 'location', lang });
            await ctx.reply(
                getText('recycle_start', lang),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            [{ text: getText('location_gps', lang), request_location: true }],
                            [{ text: getText('location_text', lang) }],
                            [{ text: getText('cancel', lang) }],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                }
            );
            return;
        }

        // 📦 Katalog
        if (text === getText('btn_catalog', lang) || text === getText('btn_catalog', 'uz') || text === getText('btn_catalog', 'ru') || text === getText('btn_catalog', 'en')) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz';
            await ctx.reply(
                lang === 'uz' ? '📦 Mahsulotlar katalogi:' : lang === 'ru' ? '📦 Каталог продукции:' : '📦 Product catalog:',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: lang === 'uz' ? '🛒 Katalogni ochish' : lang === 'ru' ? '🛒 Открыть каталог' : '🛒 Open catalog', url: appUrl }],
                            [{ text: lang === 'uz' ? '🤖 @Pack24uzbot' : '🤖 @Pack24uzbot', url: 'https://t.me/Pack24uzbot' }],
                        ],
                    },
                }
            );
            return;
        }

        // 📞 Bog'lanish
        if (text === getText('btn_contact', lang) || text === getText('btn_contact', 'uz') || text === getText('btn_contact', 'ru') || text === getText('btn_contact', 'en')) {
            await ctx.reply(
                lang === 'uz'
                    ? '📞 <b>Bog\'lanish</b>\n\n☎️ Telefon: +998 XX XXX XX XX\n💬 Telegram: @pack24uz\n🌐 Sayt: pack24.uz'
                    : lang === 'ru'
                    ? '📞 <b>Контакты</b>\n\n☎️ Телефон: +998 XX XXX XX XX\n💬 Telegram: @pack24uz\n🌐 Сайт: pack24.uz'
                    : '📞 <b>Contact Us</b>\n\n☎️ Phone: +998 XX XXX XX XX\n💬 Telegram: @pack24uz\n🌐 Website: pack24.uz',
                { parse_mode: 'HTML' }
            );
            return;
        }

        // 📋 Arizalarim
        if (text === getText('btn_my_requests', lang) || text === getText('btn_my_requests', 'uz') || text === getText('btn_my_requests', 'ru') || text === getText('btn_my_requests', 'en')) {
            const myReqs = await prisma.recycleRequest.findMany({
                where: { customerTgId: tgId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { point: true },
            });
            if (myReqs.length === 0) {
                await ctx.reply(lang === 'uz' ? '📋 Sizda hali ariza yo\'q.' : lang === 'ru' ? '📋 У вас пока нет заявок.' : '📋 You have no requests yet.');
                return;
            }
            const statusMap: Record<string, string> = {
                new: '🔵', dispatched: '📋', assigned: '🚚', en_route: '🚚', arrived: '📍',
                collecting: '⚖️', completed: '✅', cancelled: '❌',
            };
            const list = myReqs.map(r =>
                `${statusMap[r.status] || '⚪'} <b>#${r.id}</b> — ${r.point?.regionUz || '—'} — ${new Date(r.createdAt).toLocaleDateString('ru-RU')}`
            ).join('\n');
            await ctx.reply(`📋 <b>${lang === 'uz' ? 'Arizalaringiz' : lang === 'ru' ? 'Ваши заявки' : 'Your requests'}:</b>\n\n${list}`, { parse_mode: 'HTML' });
            return;
        }

        // 🤖 AI Assistent (placeholder — Gemini keyinroq)
        if (text === getText('btn_ai', lang) || text === getText('btn_ai', 'uz') || text === getText('btn_ai', 'ru') || text === getText('btn_ai', 'en')) {
            await ctx.reply(
                lang === 'uz' ? '🤖 AI Assistent tez orada ishga tushadi!' :
                lang === 'ru' ? '🤖 AI Ассистент скоро будет доступен!' :
                '🤖 AI Assistant coming soon!'
            );
            return;
        }

        // ⚙️ Sozlamalar
        if (text === getText('btn_settings', lang) || text === getText('btn_settings', 'uz') || text === getText('btn_settings', 'ru') || text === getText('btn_settings', 'en')) {
            await ctx.reply(
                lang === 'uz' ? '⚙️ <b>Sozlamalar</b>\n\nTilni o\'zgartiring:' :
                lang === 'ru' ? '⚙️ <b>Настройки</b>\n\nИзмените язык:' :
                '⚙️ <b>Settings</b>\n\nChange language:',
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [btn('🇺🇿 O\'zbekcha', 'lang_uz'), btn('🇷🇺 Русский', 'lang_ru'), btn('🇬🇧 English', 'lang_en')],
                        ],
                    },
                }
            );
            return;
        }

        // ── Lokatsiya matn ko'rinishida ─────────────────────────────
        if (ses?.step === 'location' && !text.startsWith('/')) {
            // Matn manzili — GPS yo'q, lekin davom etamiz
            ses.lat = 0;
            ses.lng = 0;
            ses.step = 'choose_method';
            const l = ses.lang;

            await ctx.reply(
                getText('recycle_choose', l),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [btn(getText('btn_self_delivery', l), 'recycle_self')],
                            [btn(getText('btn_call_truck', l), 'recycle_truck')],
                            [btn(getText('cancel', l), 'recycle_cancel')],
                        ],
                    },
                }
            );
            return;
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // YORDAMCHI FUNKSIYALAR
    // ══════════════════════════════════════════════════════════════════════

    // Mashina chaqirish arizasini yuborish
    async function submitTruckRequest(ctx: Context, _bot: Telegraf, ses: CustomerSession, tgId: string, photoUrl?: string) {
        const lang = ses.lang;

        // Eng yaqin bazani topish
        const points = await prisma.recyclePoint.findMany({
            where: { status: 'active' },
            include: { supervisors: { where: { isActive: true }, take: 1 } },
        });

        let nearestPoint = points[0];
        if (ses.lat && ses.lng && ses.lat !== 0) {
            const sorted = points
                .filter(p => p.lat && p.lng)
                .map(p => ({ ...p, dist: haversineDistance(ses.lat!, ses.lng!, p.lat!, p.lng!) }))
                .sort((a, b) => a.dist - b.dist);
            if (sorted.length > 0) nearestPoint = sorted[0];
        }

        if (!nearestPoint) {
            await ctx.reply(lang === 'uz' ? '❌ Aktiv punkt topilmadi.' : '❌ No active point found.');
            sessions.delete(tgId);
            return;
        }

        // Arizani bazaga yozish
        const request = await prisma.recycleRequest.create({
            data: {
                name: ses.name || ctx.from!.first_name || 'Nomalum',
                phone: ses.phone || '',
                regionId: nearestPoint.id,
                pickupType: 'pickup',
                pickupLat: ses.lat || null,
                pickupLng: ses.lng || null,
                customerTgId: tgId,
                customerLang: lang,
                volumeSize: ses.volumeSize || null,
                photoUrl: photoUrl || null,
                status: 'new',
            },
        });

        await ctx.reply(getText('truck_request_sent', lang), { parse_mode: 'HTML' });

        // Masulga xabar
        const sup = nearestPoint.supervisors[0];
        if (sup?.telegramId) {
            const volLabel = ses.volumeSize === 'small' ? '📦 Kichik' : ses.volumeSize === 'medium' ? '📦📦 O\'rta' : '📦📦📦 Katta';
            const adminMsg =
                `🆕 <b>Yangi ariza #${request.id}</b>\n\n` +
                `👤 ${request.name}\n` +
                `📞 ${request.phone}\n` +
                `📍 ${nearestPoint.regionUz}\n` +
                `⚖️ Hajm: ${volLabel}\n` +
                `📸 Rasm: ${photoUrl ? 'Bor' : 'Yo\'q'}\n\n` +
                `Haydovchi tayinlang 👇`;

            await notifyAdmin(sup.telegramId, adminMsg);
        }

        sessions.delete(tgId);
    }

    // Xodim kodi bilan ro'yxatdan o'tish
    async function handleRegistrationCode(ctx: Context, tgId: string, code: string) {
        if (!/^\d{5}$/.test(code)) {
            await ctx.reply('❌ 5 ta raqam kiriting! <i>Masalan: 48271</i>', { parse_mode: 'HTML' });
            return;
        }

        // Haydovchi
        const driver = await prisma.driver.findFirst({ where: { registrationCode: code } });
        if (driver) {
            if (driver.telegramId && driver.telegramId !== tgId) {
                await ctx.reply('❌ Bu kod boshqa foydalanuvchiga ulangan.');
                registrationSessions.delete(tgId);
                return;
            }
            await prisma.driver.update({
                where: { id: driver.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from!.username || ctx.from!.first_name || null,
                    registeredAt: new Date(),
                    isOnline: true,
                    lastSeenAt: new Date(),
                },
            });
            registrationSessions.delete(tgId);
            await ctx.reply(
                `✅ <b>Muvaffaqiyatli!</b>\n\n🚚 Siz <b>Haydovchi</b> sifatida ulangingiz.\n👤 ${driver.name}\n\n` +
                `⚠️ Endi <b>@pack24MX_bot</b> ga o'ting — u yerda ishlaringiz ko'rinadi.`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // Masul
        const supervisor = await prisma.supervisor.findFirst({ where: { registrationCode: code } });
        if (supervisor) {
            if (supervisor.telegramId && supervisor.telegramId !== tgId) {
                await ctx.reply('❌ Bu kod boshqa foydalanuvchiga ulangan.');
                registrationSessions.delete(tgId);
                return;
            }
            await prisma.supervisor.update({
                where: { id: supervisor.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from!.username || ctx.from!.first_name || null,
                    registeredAt: new Date(),
                },
            });
            registrationSessions.delete(tgId);
            await ctx.reply(
                `✅ <b>Muvaffaqiyatli!</b>\n\n👷 Siz <b>Masul shaxs</b> sifatida ulangingiz.\n👤 ${supervisor.name}\n\n` +
                `⚠️ Endi <b>@pack24AUP_bot</b> ga o'ting — u yerda arizalar va to'lovlar ko'rinadi.`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        await ctx.reply(`❌ <b>Kod topilmadi!</b>\n<code>${code}</code> — bazada yo'q.\n\nBekor: /start`, { parse_mode: 'HTML' });
    }

    customerBotInstance = bot;
    return bot;
};
