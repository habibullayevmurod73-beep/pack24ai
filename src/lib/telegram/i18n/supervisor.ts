// ─── Masul (Supervisor) bot matnlari ─────────────────────────────────────────
import type { Lang } from './index';

type Texts = Record<string, Record<Lang, string>>;

export const supervisorTexts: Texts = {
    adm_welcome: {
        uz: '👷 <b>Pack24 — Masul boti</b>\n\nXush kelibsiz! Ro\'yxatdan o\'tish uchun telefon raqamingizni ulashing 👇',
        ru: '👷 <b>Pack24 — Бот ответственного</b>\n\nДобро пожаловать! Поделитесь номером телефона для регистрации 👇',
        en: '👷 <b>Pack24 — Supervisor Bot</b>\n\nWelcome! Share your phone number to register 👇',
    },
    adm_share_phone: { uz: '📱 Kontaktni ulashish', ru: '📱 Поделиться контактом', en: '📱 Share Contact' },
    adm_not_in_db: {
        uz: '❌ <b>Raqamingiz tizimda topilmadi!</b>\n\nAdmin bilan bog\'laning:\n📞 +998 88 055-78-88',
        ru: '❌ <b>Номер не найден в системе!</b>\n\nСвяжитесь с администратором:\n📞 +998 88 055-78-88',
        en: '❌ <b>Phone not found in system!</b>\n\nContact admin:\n📞 +998 88 055-78-88',
    },
    adm_already_registered: {
        uz: '⚠️ Bu telefon raqam boshqa Telegram akkauntga bog\'langan.\nAdmin bilan bog\'laning.',
        ru: '⚠️ Этот номер привязан к другому аккаунту Telegram.\nОбратитесь к администратору.',
        en: '⚠️ This phone is linked to another Telegram account.\nContact admin.',
    },
    adm_code_sent: {
        uz: '✅ <b>Muvaffaqiyatli ro\'yxatdan o\'tdingiz!</b>\n\n👤 {name}\n🏭 Punkt: {point}\n\n🔑 <b>Sizning verifikatsion kodingiz:</b>\n\n<code>{code}</code>\n\n📌 Bu kodni xotirada saqlang.\n\nAdmin panelda ham ko\'rinadi ✓',
        ru: '✅ <b>Успешно зарегистрированы!</b>\n\n👤 {name}\n🏭 Пункт: {point}\n\n🔑 <b>Ваш верификационный код:</b>\n\n<code>{code}</code>\n\n📌 Сохраните этот код.\n\nТакже виден в панели администратора ✓',
        en: '✅ <b>Successfully registered!</b>\n\n👤 {name}\n🏭 Point: {point}\n\n🔑 <b>Your verification code:</b>\n\n<code>{code}</code>\n\n📌 Save this code.\n\nAlso visible in admin panel ✓',
    },
    adm_registered: {
        uz: '✅ <b>Muvaffaqiyatli!</b>\n\n👷 Siz masul sifatida ro\'yxatdan o\'tdingiz.\n👤 {name}\n🏭 Punkt: {point}\n\nQuyidagi tugmalar orqali ishlang 👇',
        ru: '✅ <b>Успешно!</b>\n\n👷 Вы зарегистрированы как ответственный.\n👤 {name}\n🏭 Пункт: {point}\n\nИспользуйте кнопки ниже 👇',
        en: '✅ <b>Success!</b>\n\n👷 You are registered as a supervisor.\n👤 {name}\n🏭 Point: {point}\n\nUse the buttons below 👇',
    },
    adm_not_registered: {
        uz: '❌ Siz masul sifatida ro\'yxatdan o\'tmagansiz.\n\n5 raqamli kodingizni kiriting yoki /start bosing.',
        ru: '❌ Вы не зарегистрированы как ответственный.\n\nВведите 5-значный код или нажмите /start.',
        en: '❌ You are not registered as a supervisor.\n\nEnter your 5-digit code or press /start.',
    },
    adm_btn_requests: { uz: '📋 Arizalar', ru: '📋 Заявки', en: '📋 Requests' },
    adm_btn_drivers: { uz: '👥 Haydovchilar', ru: '👥 Водители', en: '👥 Drivers' },
    adm_btn_payments: { uz: '💰 To\'lovlar', ru: '💰 Оплаты', en: '💰 Payments' },
    adm_btn_point: { uz: '🏭 Punkt holati', ru: '🏭 Управление пунктом', en: '🏭 Point management' },
    adm_btn_report: { uz: '📊 Hisobotlar', ru: '📊 Отчёты', en: '📊 Reports' },
    adm_no_requests: { uz: '📋 Hozircha yangi ariza yo\'q.', ru: '📋 Пока нет новых заявок.', en: '📋 No new requests yet.' },
    adm_request_info: {
        uz: '📋 <b>Ariza #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Hajm: {volume}\n📸 Rasm: {photo}\n🕐 {time}\n\n📌 Status: {status}',
        ru: '📋 <b>Заявка #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Объём: {volume}\n📸 Фото: {photo}\n🕐 {time}\n\n📌 Статус: {status}',
        en: '📋 <b>Request #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Volume: {volume}\n📸 Photo: {photo}\n🕐 {time}\n\n📌 Status: {status}',
    },
    adm_select_driver: {
        uz: '🚚 <b>Ariza #{id} uchun haydovchi tanlang:</b>',
        ru: '🚚 <b>Выберите водителя для заявки #{id}:</b>',
        en: '🚚 <b>Select a driver for request #{id}:</b>',
    },
    adm_driver_assigned: {
        uz: '✅ Ariza #{id} ga <b>{driver}</b> tayinlandi!\n\nHaydovchi va mijozga xabar yuborildi.',
        ru: '✅ На заявку #{id} назначен <b>{driver}</b>!\n\nВодитель и клиент уведомлены.',
        en: '✅ <b>{driver}</b> assigned to request #{id}!\n\nDriver and customer notified.',
    },
    adm_no_drivers: { uz: '❌ Hozircha online haydovchi yo\'q.', ru: '❌ Пока нет водителей онлайн.', en: '❌ No drivers online.' },
    adm_point_status: {
        uz: '🏭 <b>{name}</b>\n\n📍 Holat: {status}\n🕐 Ish vaqti: {hours}\n\nO\'zgartiring 👇',
        ru: '🏭 <b>{name}</b>\n\n📍 Статус: {status}\n🕐 Рабочее время: {hours}\n\nИзмените 👇',
        en: '🏭 <b>{name}</b>\n\n📍 Status: {status}\n🕐 Working hours: {hours}\n\nChange 👇',
    },
    adm_point_toggled: { uz: '✅ Punkt holati o\'zgartirildi: {status}', ru: '✅ Статус пункта изменён: {status}', en: '✅ Point status changed: {status}' },
    adm_report: {
        uz: '📊 <b>Hisobot — {period}</b>\n\n📋 Arizalar: {requests}\n✅ Bajarilgan: {completed}\n⚖️ Jami og\'irlik: {weight} kg\n💰 Jami summa: {amount} so\'m\n🚚 Haydovchilar: {drivers}',
        ru: '📊 <b>Отчёт — {period}</b>\n\n📋 Заявок: {requests}\n✅ Выполнено: {completed}\n⚖️ Общий вес: {weight} кг\n💰 Общая сумма: {amount} сум\n🚚 Водителей: {drivers}',
        en: '📊 <b>Report — {period}</b>\n\n📋 Requests: {requests}\n✅ Completed: {completed}\n⚖️ Total weight: {weight} kg\n💰 Total amount: {amount} UZS\n🚚 Drivers: {drivers}',
    },
    adm_payment_info: {
        uz: '💰 <b>To\'lov #{id}</b>\n\n👤 Mijoz: {customer}\n🚚 Haydovchi: {driver}\n⚖️ Og\'irlik: {weight} kg\n💵 Summa: {amount} so\'m\n\n📌 Holat: {status}',
        ru: '💰 <b>Оплата #{id}</b>\n\n👤 Клиент: {customer}\n🚚 Водитель: {driver}\n⚖️ Вес: {weight} кг\n💵 Сумма: {amount} сум\n\n📌 Статус: {status}',
        en: '💰 <b>Payment #{id}</b>\n\n👤 Customer: {customer}\n🚚 Driver: {driver}\n⚖️ Weight: {weight} kg\n💵 Amount: {amount} UZS\n\n📌 Status: {status}',
    },
    adm_payment_approved: { uz: '✅ To\'lov #{id} tasdiqlandi!', ru: '✅ Оплата #{id} подтверждена!', en: '✅ Payment #{id} approved!' },
};
