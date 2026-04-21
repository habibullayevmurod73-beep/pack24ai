// ═══════════════════════════════════════════════════════════════════════════════
// Text message handler + Contact handler
// Registration, persistent keyboard, ariza session, driver kalkulator input
// ═══════════════════════════════════════════════════════════════════════════════

import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { MAT, btn, fmtN, getStatusLabel } from '../constants';
import { arizaSessions, complaintSessions, registrationSessions } from '../sessions';
import { customerKeyboard, supervisorKeyboard, driverKeyboard } from '../keyboards';
import { startArizaFlow, createArizaFromSession } from './arizaHandler';

export function registerTextHandler(bot: Telegraf) {

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
    // TEXT HANDLER — asosiy matn qabul qiluvchi
    // ════════════════════════════════════════════════════════════════════════
    bot.on('text', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const text = ctx.message.text;
        const config = await prisma.telegramConfig.findFirst();

        // Agar /buyruq bo'lsa — skip
        if (text.startsWith('/')) return;

        // ── RO'YXATDAN O'TISH: Kod tekshirish ─────────────────────────
        if (registrationSessions.has(tgId)) {
            const code = text.trim();

            if (!/^\d{5}$/.test(code)) {
                await ctx.reply(
                    `❌ Noto'g'ri format!\n\n5 ta raqam kiriting.\n<i>Masalan: 48271</i>`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // Haydovchi
            const driver = await prisma.driver.findFirst({ where: { registrationCode: code } });
            if (driver) {
                if (driver.telegramId && driver.telegramId !== tgId) {
                    await ctx.reply(`❌ Bu kod boshqa foydalanuvchiga ulangan.\nAdmin bilan bog'laning.`);
                    registrationSessions.delete(tgId);
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
                registrationSessions.delete(tgId);

                await ctx.reply(
                    `✅ <b>Muvaffaqiyatli ro'yxatdan o'tdingiz!</b>\n\n` +
                    `🚚 Siz <b>Haydovchi</b> sifatida tizimga ulangingiz.\n` +
                    `👤 Ism: <b>${driver.name}</b>\n` +
                    `📞 Telefon: <b>${driver.phone}</b>\n\n` +
                    `Endi quyidagi tugmalar orqali ishlang 👇`,
                    { parse_mode: 'HTML', reply_markup: driverKeyboard() }
                );
                return;
            }

            // Masul
            const supervisor = await prisma.supervisor.findFirst({ where: { registrationCode: code } });
            if (supervisor) {
                if (supervisor.telegramId && supervisor.telegramId !== tgId) {
                    await ctx.reply(`❌ Bu kod boshqa foydalanuvchiga ulangan.\nAdmin bilan bog'laning.`);
                    registrationSessions.delete(tgId);
                    return;
                }

                await prisma.supervisor.update({
                    where: { id: supervisor.id },
                    data: {
                        telegramId: tgId,
                        telegramName: ctx.from.username || ctx.from.first_name || null,
                        registeredAt: new Date(),
                    },
                });
                registrationSessions.delete(tgId);

                await ctx.reply(
                    `✅ <b>Muvaffaqiyatli ro'yxatdan o'tdingiz!</b>\n\n` +
                    `👷 Siz <b>Masul shaxs</b> sifatida tizimga ulangingiz.\n` +
                    `👤 Ism: <b>${supervisor.name}</b>\n` +
                    `📞 Telefon: <b>${supervisor.phone}</b>\n\n` +
                    `Endi quyidagi tugmalar orqali boshqaring 👇`,
                    { parse_mode: 'HTML', reply_markup: supervisorKeyboard() }
                );
                return;
            }

            await ctx.reply(
                `❌ <b>Kod topilmadi!</b>\n\n` +
                `<code>${code}</code> raqami bazada mavjud emas.\n\n` +
                `Tekshiring va qayta kiriting yoki admin bilan bog'laning.\n` +
                `Bekor qilish: /start`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        // ── "♻️ Ariza yuborish" tugmasi ─────────────────────────────────
        if (text === '♻️ Ariza yuborish') {
            await startArizaFlow(ctx);
            return;
        }

        // ── ARIZA SESSION: bosqichma-bosqich ─────────────────────────────
        const ses = arizaSessions.get(tgId);
        if (text === '❌ Bekor qilish' && ses) {
            arizaSessions.delete(tgId);
            await ctx.reply('❌ Ariza bekor qilindi.', { reply_markup: customerKeyboard('uz', process.env.NEXT_PUBLIC_APP_URL || 'https://pack24.uz') });
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
                await createArizaFromSession(ctx, tgId, 'pickup', address, bot);
                return;
            }

            // Noma'lum step
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
                            r.status === 'assigned' ? [btn('🚚 Yo\'lga chiqdim', `enroute_${r.id}`)] :
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

                if (complaint.level === 'supervisor' && req?.supervisor?.telegramId) {
                    await bot.telegram.sendMessage(req.supervisor.telegramId,
                        `⚠️ <b>Yangi shikoyat!</b>\n\n` +
                        `📋 Ariza: #${complaint.requestId}\n` +
                        `👤 ${ctx.from.first_name || 'Mijoz'}\n` +
                        `📝 ${complaintText.slice(0, 200)}`,
                        { parse_mode: 'HTML' }
                    );
                }

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
}
