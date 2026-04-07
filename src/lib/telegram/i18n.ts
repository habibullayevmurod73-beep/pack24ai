// ─── Pack24 Ko'p tilli matnlar bazasi ────────────────────────────────────────
// Har bir kalit uchun 3 tilda tarjima

export type Lang = 'uz' | 'ru' | 'en';

type Texts = Record<string, Record<Lang, string>>;

export const t: Texts = {
    // ─── /start va Ro'yxatdan o'tish ────────────────────────────────────
    welcome: {
        uz: '🏭 <b>Pack24 — Qadoqlash Yechimlari</b>\n\nAssalomu alaykum! Til tanlang 👇',
        ru: '🏭 <b>Pack24 — Упаковочные Решения</b>\n\nЗдравствуйте! Выберите язык 👇',
        en: '🏭 <b>Pack24 — Packaging Solutions</b>\n\nHello! Choose your language 👇',
    },
    register_name: {
        uz: '👤 Iltimos, <b>Ismingiz va Familiyangizni</b> kiriting:\n<i>Masalan: Alisher Karimov</i>',
        ru: '👤 Пожалуйста, введите <b>Имя и Фамилию</b>:\n<i>Например: Алишер Каримов</i>',
        en: '👤 Please enter your <b>Full Name</b>:\n<i>Example: Alisher Karimov</i>',
    },
    register_phone: {
        uz: '📱 Telefon raqamingizni yuboring:',
        ru: '📱 Отправьте свой номер телефона:',
        en: '📱 Send your phone number:',
    },
    register_success: {
        uz: '✅ Ro\'yxatdan muvaffaqiyatli o\'tdingiz!\n\nQuyidagi tugmalar orqali foydalaning 👇',
        ru: '✅ Вы успешно зарегистрированы!\n\nИспользуйте кнопки ниже 👇',
        en: '✅ Successfully registered!\n\nUse the buttons below 👇',
    },
    share_contact: {
        uz: '📱 Kontakt yuborish',
        ru: '📱 Отправить контакт',
        en: '📱 Share Contact',
    },

    // ─── Bosh menyu tugmalari ────────────────────────────────────────────
    btn_catalog: {
        uz: '📦 Mahsulotlar katalogi',
        ru: '📦 Каталог продукции',
        en: '📦 Product Catalog',
    },
    btn_recycle: {
        uz: '♻️ Makulatura xizmati',
        ru: '♻️ Услуга по макулатуре',
        en: '♻️ Recycling Service',
    },
    btn_ai: {
        uz: '🤖 AI Assistent',
        ru: '🤖 AI Ассистент',
        en: '🤖 AI Assistant',
    },
    btn_contact: {
        uz: '📞 Bog\'lanish',
        ru: '📞 Связаться',
        en: '📞 Contact Us',
    },
    btn_my_requests: {
        uz: '📋 Arizalarim',
        ru: '📋 Мои заявки',
        en: '📋 My Requests',
    },
    btn_settings: {
        uz: '⚙️ Sozlamalar',
        ru: '⚙️ Настройки',
        en: '⚙️ Settings',
    },

    // ─── Makulatura oqimi ────────────────────────────────────────────────
    recycle_start: {
        uz: '♻️ <b>Makulatura xizmati</b>\n\nIltimos, joylashuvingizni yuboring 👇',
        ru: '♻️ <b>Услуга макулатуры</b>\n\nПожалуйста, отправьте свою геолокацию 👇',
        en: '♻️ <b>Recycling Service</b>\n\nPlease send your location 👇',
    },
    location_gps: {
        uz: '📍 GPS orqali yuborish',
        ru: '📍 Отправить по GPS',
        en: '📍 Send via GPS',
    },
    location_map: {
        uz: '🗺️ Xaritadan tanlash',
        ru: '🗺️ Выбрать на карте',
        en: '🗺️ Choose on map',
    },
    location_text: {
        uz: '✍️ Manzilni yozish',
        ru: '✍️ Написать адрес',
        en: '✍️ Type address',
    },
    recycle_choose: {
        uz: '📍 Joylashuvingiz qabul qilindi!\n\n<b>Qanday topshirmoqchisiz?</b>',
        ru: '📍 Ваша геолокация принята!\n\n<b>Как хотите сдать?</b>',
        en: '📍 Location received!\n\n<b>How would you like to deliver?</b>',
    },
    btn_self_delivery: {
        uz: '🏭 O\'zim olib boraman',
        ru: '🏭 Привезу сам',
        en: '🏭 Self-delivery',
    },
    btn_call_truck: {
        uz: '🚛 Mashina chaqiraman',
        ru: '🚛 Вызвать машину',
        en: '🚛 Call a truck',
    },

    // ─── Eng yaqin punkt ─────────────────────────────────────────────────
    nearest_point: {
        uz: '📍 <b>Eng yaqin punkt:</b> {name}\n📏 Masofa: ~{distance} km\n🕐 Ish tartibi: {schedule}\n{status}\n\n💰 <b>Narxlar:</b>\n{prices}\n\n👷 Masul: <b>{supervisor}</b>\n📞 Tel: {phone}\n💬 Telegram: @{telegram}\n\n📍 Lokatsiya:',
        ru: '📍 <b>Ближайший пункт:</b> {name}\n📏 Расстояние: ~{distance} км\n🕐 Режим работы: {schedule}\n{status}\n\n💰 <b>Цены:</b>\n{prices}\n\n👷 Ответственный: <b>{supervisor}</b>\n📞 Тел: {phone}\n💬 Telegram: @{telegram}\n\n📍 Локация:',
        en: '📍 <b>Nearest point:</b> {name}\n📏 Distance: ~{distance} km\n🕐 Working hours: {schedule}\n{status}\n\n💰 <b>Prices:</b>\n{prices}\n\n👷 Supervisor: <b>{supervisor}</b>\n📞 Phone: {phone}\n💬 Telegram: @{telegram}\n\n📍 Location:',
    },
    point_open: {
        uz: '🟢 <b>OCHIQ</b> — qabul qilinmoqda',
        ru: '🟢 <b>ОТКРЫТ</b> — принимается',
        en: '🟢 <b>OPEN</b> — accepting',
    },
    point_closed: {
        uz: '🔴 <b>YOPIQ</b> — hozircha qabul bo\'lmayapti',
        ru: '🔴 <b>ЗАКРЫТ</b> — временно не принимается',
        en: '🔴 <b>CLOSED</b> — not accepting now',
    },

    // ─── Mashina chaqirish ───────────────────────────────────────────────
    truck_volume: {
        uz: '⚖️ <b>Taxminiy hajmni tanlang:</b>',
        ru: '⚖️ <b>Выберите примерный объём:</b>',
        en: '⚖️ <b>Select approximate volume:</b>',
    },
    vol_small: {
        uz: '📦 Kichik (50 kg gacha)',
        ru: '📦 Малый (до 50 кг)',
        en: '📦 Small (up to 50 kg)',
    },
    vol_medium: {
        uz: '📦📦 O\'rta (50–200 kg)',
        ru: '📦📦 Средний (50–200 кг)',
        en: '📦📦 Medium (50–200 kg)',
    },
    vol_large: {
        uz: '📦📦📦 Katta (200+ kg)',
        ru: '📦📦📦 Большой (200+ кг)',
        en: '📦📦📦 Large (200+ kg)',
    },
    truck_photo: {
        uz: '📸 Iloji bo\'lsa makulaturangiz rasmini yuboring.\nBu haydovchiga tayyorgarlik ko\'rishga yordam beradi.',
        ru: '📸 Если возможно, отправьте фото макулатуры.\nЭто поможет водителю подготовиться.',
        en: '📸 If possible, send a photo of your recyclables.\nThis helps the driver prepare.',
    },
    btn_skip_photo: {
        uz: '⏭️ O\'tkazib yuborish',
        ru: '⏭️ Пропустить',
        en: '⏭️ Skip',
    },
    truck_request_sent: {
        uz: '✅ <b>Arizangiz qabul qilindi!</b>\n\nMasul xodim tez orada haydovchi tayinlaydi.\nJarayon haqida sizga avtomatik xabar berib boriladi 👇',
        ru: '✅ <b>Заявка принята!</b>\n\nОтветственный сотрудник скоро назначит водителя.\nВы будете получать уведомления автоматически 👇',
        en: '✅ <b>Request accepted!</b>\n\nA supervisor will assign a driver soon.\nYou will receive automatic updates 👇',
    },

    // ─── Status tracking ─────────────────────────────────────────────────
    status_new: { uz: '🔵 Yangi', ru: '🔵 Новая', en: '🔵 New' },
    status_dispatched: { uz: '📋 Masulga yuborildi', ru: '📋 Отправлено ответственному', en: '📋 Dispatched' },
    status_assigned: { uz: '🚚 Haydovchi tayinlandi', ru: '🚚 Водитель назначен', en: '🚚 Driver assigned' },
    status_en_route: { uz: '🚚 Haydovchi yo\'lda', ru: '🚚 Водитель в пути', en: '🚚 Driver en route' },
    status_arrived: { uz: '📍 Haydovchi yetib keldi', ru: '📍 Водитель прибыл', en: '📍 Driver arrived' },
    status_collecting: { uz: '⚖️ Tortilmoqda', ru: '⚖️ Взвешивание', en: '⚖️ Weighing' },
    status_completed: { uz: '✅ Yakunlandi', ru: '✅ Завершено', en: '✅ Completed' },
    status_cancelled: { uz: '❌ Bekor qilindi', ru: '❌ Отменено', en: '❌ Cancelled' },

    // ─── Umumiy ──────────────────────────────────────────────────────────
    cancel: { uz: '❌ Bekor qilish', ru: '❌ Отменить', en: '❌ Cancel' },
    back: { uz: '🔙 Orqaga', ru: '🔙 Назад', en: '🔙 Back' },
    error: {
        uz: '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
        ru: '❌ Произошла ошибка. Попробуйте снова.',
        en: '❌ An error occurred. Please try again.',
    },
    register_code_btn: {
        uz: '🔑 Kod bilan kirish (xodim)',
        ru: '🔑 Войти по коду (сотрудник)',
        en: '🔑 Login with code (staff)',
    },
};

// Yordamchi: matnni olish
export function getText(key: string, lang: Lang): string {
    return t[key]?.[lang] || t[key]?.uz || key;
}

// Yordamchi: template o'zgaruvchilarni almashtirish
export function formatText(key: string, lang: Lang, vars: Record<string, string>): string {
    let text = getText(key, lang);
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}
