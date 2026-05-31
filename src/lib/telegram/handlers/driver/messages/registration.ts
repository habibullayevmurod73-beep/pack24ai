import { Telegraf } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { getDriver, sessions } from '../helpers';
import { driverMainKeyboard, driverSharePhoneKeyboard } from '../../../keyboards';
import { notifyAdmin, notifyAllPack24Admins } from '../../../notifier';
import { createBotEvent } from '../../../botEvents';
import { createOrReuseBotAccessRequest } from '../../../botAccessRequests';
import { persistDriverCredentials, formatDriverCredentialsMessage } from '../../../driverCredentials';

export function registerRegistrationHandlers(bot: Telegraf) {
    // LOCATION HANDLER — GPS tracking
    bot.on('location', async (ctx) => {
        const tgId = ctx.from.id.toString();
        const { latitude, longitude } = ctx.message.location;
        const driver = await getDriver(tgId);
        if (!driver) return;

        await prisma.driver.update({
            where: { id: driver.id },
            data: {
                lastLat: latitude,
                lastLng: longitude,
                lastSeenAt: new Date(),
            },
        });

        await ctx.reply(
            `📍 Joylashuvingiz yangilandi\n` +
            `🕐 ${new Date().toLocaleTimeString('ru-RU')}`,
            { reply_markup: driverMainKeyboard(driver.isOnline, 'uz') }
        );
    });

    // CONTACT HANDLER
    bot.on('contact', async (ctx) => {
        const tgId = ctx.from.id.toString();

        if (ctx.message.contact.user_id && ctx.message.contact.user_id !== ctx.from.id) {
            await ctx.reply('❌ Iltimos, faqat o\'z telefon raqamingizni ulashing.', {
                reply_markup: driverSharePhoneKeyboard(),
            });
            return;
        }

        let phone = ctx.message.contact.phone_number.replace(/[^0-9+]/g, '');
        if (!phone.startsWith('+')) phone = '+' + phone;

        try {
            const driver = await prisma.driver.findFirst({
                where: {
                    OR: [
                        { phone },
                        { phone: phone.replace('+', '') },
                        { phone: phone.replace('+998', '0') },
                        { phone: phone.slice(-9) },
                    ],
                },
                include: { point: true, supervisor: true },
            });

            if (!driver) {
                const result = await createOrReuseBotAccessRequest({
                    role: 'driver',
                    name: ctx.from.first_name || ctx.from.username || 'Driver nomzod',
                    phone,
                    telegramId: tgId,
                    telegramName: ctx.from.username || ctx.from.first_name || null,
                    sourceBot: 'driver',
                });

                if (result.kind === 'pending') {
                    await ctx.reply(
                        `⏳ <b>Arizangiz allaqachon ko'rib chiqilmoqda.</b>\n\n` +
                        `📱 Telefon: <code>${phone}</code>\n` +
                        `Admin tasdiqlagandan keyin sizga xabar beriladi.`,
                        { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } },
                    );
                    sessions.delete(tgId);
                    return;
                }

                await ctx.reply(
                    `✅ <b>Driver bo'lish uchun ariza qabul qilindi.</b>\n\n` +
                    `📱 Telefon: <code>${phone}</code>\n\n` +
                    `Admin arizangizni tasdiqlagandan keyin ushbu bot orqali ishlashingiz mumkin bo'ladi.`,
                    { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }
                );
                sessions.delete(tgId);
                return;
            }

            // Telegram ID boshqa bo'lsa — yangilash (qurilma/akkaunt almashuvi)
            if (driver.telegramId && driver.telegramId.trim() !== tgId) {
                console.log(`[DriverBot] telegramId yangilanmoqda: ${driver.telegramId.trim()} → ${tgId}`);
            }

            // 1) Telegram ulanmasini saqlash + status active
            await prisma.driver.update({
                where: { id: driver.id },
                data: {
                    telegramId: tgId,
                    telegramName: ctx.from.username || ctx.from.first_name || null,
                    registeredAt: new Date(),
                    isOnline: true,
                    lastSeenAt: new Date(),
                    status: 'active',
                },
            });

            // 2) Yangi parol va kod generatsiya qilish + audit yozish
            //    (kim taqdim etgani: supervisor + point)
            const credentials = await persistDriverCredentials(driver.id, {
                issuedBySupervisorId: driver.supervisorId,
                issuedByPointId: driver.pointId,
            });

            await createBotEvent({
                sourceBot: 'driver',
                eventType: 'driver.registered',
                entityType: 'driver',
                entityId: driver.id,
                severity: 'success',
                title: 'Haydovchi botga ro\'yxatdan o\'tdi',
                message: `${driver.name} driver botga ulandi (kod va parol berildi).`,
                driverId: driver.id,
                supervisorId: driver.supervisorId ?? undefined,
                pointId: driver.pointId ?? undefined,
                payload: {
                    phone: driver.phone,
                    registrationCode: credentials.code,
                    invitedBySupervisorId: driver.supervisorId,
                    invitedByPointId: driver.pointId,
                },
            });

            sessions.delete(tgId);

            // 3) Haydovchiga to'liq kirish ma'lumotlari + kim taqdim etgani
            await ctx.reply(
                formatDriverCredentialsMessage({
                    name: driver.name,
                    phone: driver.phone,
                    code: credentials.code,
                    password: credentials.password,
                    supervisorName: driver.supervisor?.name ?? null,
                    pointRegion: driver.point?.regionUz ?? null,
                    pointCity: driver.point?.cityUz ?? null,
                }),
                {
                    parse_mode: 'HTML',
                    reply_markup: driverMainKeyboard(true, 'uz'),
                }
            );

            // 4) Mas'ulga ham xabar (audit ko'rinish)
            if (driver.supervisor?.telegramId) {
                await notifyAdmin(
                    driver.supervisor.telegramId,
                    `🆕 <b>Haydovchi ro'yxatdan o'tdi!</b>\n\n` +
                    `👤 ${driver.name}\n` +
                    `📞 ${driver.phone}\n` +
                    `🏭 Punkt: ${driver.point?.regionUz || '—'}, ${driver.point?.cityUz || '—'}\n` +
                    `🔑 Kod: <code>${credentials.code}</code>\n` +
                    `🔐 Parol: bot tomonidan berildi\n` +
                    `🕐 ${new Date().toLocaleString('ru-RU')}`
                );
            }

            // 5) HQ adminlarga xabar
            await notifyAllPack24Admins(
                `🆕 <b>Yangi haydovchi ro'yxatdan o'tdi</b>\n\n` +
                `👤 ${driver.name}\n` +
                `📞 ${driver.phone}\n` +
                `👨‍💼 Mas'ul: ${driver.supervisor?.name || '—'}\n` +
                `🏭 Punkt: ${driver.point?.regionUz || '—'}, ${driver.point?.cityUz || '—'}\n` +
                `🕐 ${new Date().toLocaleString('ru-RU')}`,
            );

            console.log(
                `[DriverBot] ✅ Haydovchi ro'yxatdan o'tdi: ${driver.name} | ` +
                `Kod: ${credentials.code} | Masul: ${driver.supervisor?.name || '—'} | ` +
                `Punkt: ${driver.point?.regionUz || '—'}`
            );

        } catch (err) {
            console.error('[DriverBot] Contact handler xatolik:', err);
            await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', {
                reply_markup: { remove_keyboard: true },
            });
        }
    });
}
