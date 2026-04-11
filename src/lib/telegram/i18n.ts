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

    // ═══════════════════════════════════════════════════════════════════════
    // HAYDOVCHI BOT (driverBot) MATNLARI
    // ═══════════════════════════════════════════════════════════════════════

    drv_welcome: {
        uz: '🚚 <b>Pack24 — Haydovchi boti</b>\n\n5 raqamli kodingizni kiriting 👇\n<i>Admin bergan kod</i>',
        ru: '🚚 <b>Pack24 — Бот водителя</b>\n\nВведите 5-значный код 👇\n<i>Код от администратора</i>',
        en: '🚚 <b>Pack24 — Driver Bot</b>\n\nEnter your 5-digit code 👇\n<i>Code from admin</i>',
    },
    drv_registered: {
        uz: '✅ <b>Muvaffaqiyatli!</b>\n\n🚚 Siz haydovchi sifatida ro\'yxatdan o\'tdingiz.\n👤 {name}\n\nQuyidagi tugmalar orqali ishlang 👇',
        ru: '✅ <b>Успешно!</b>\n\n🚚 Вы зарегистрированы как водитель.\n👤 {name}\n\nИспользуйте кнопки ниже 👇',
        en: '✅ <b>Success!</b>\n\n🚚 You are registered as a driver.\n👤 {name}\n\nUse the buttons below 👇',
    },
    drv_not_registered: {
        uz: '❌ Siz haydovchi sifatida ro\'yxatdan o\'tmagansiz.\n\n5 raqamli kodingizni kiriting yoki /start bosing.',
        ru: '❌ Вы не зарегистрированы как водитель.\n\nВведите 5-значный код или нажмите /start.',
        en: '❌ You are not registered as a driver.\n\nEnter your 5-digit code or press /start.',
    },
    drv_btn_tasks: {
        uz: '📋 Topshiriqlar',
        ru: '📋 Задания',
        en: '📋 Tasks',
    },
    drv_btn_report: {
        uz: '📊 Kunlik hisobot',
        ru: '📊 Дневной отчёт',
        en: '📊 Daily report',
    },
    drv_btn_online: {
        uz: '🟢 Men onlineman',
        ru: '🟢 Я онлайн',
        en: '🟢 I\'m online',
    },
    drv_btn_offline: {
        uz: '🔴 Offlineman',
        ru: '🔴 Я оффлайн',
        en: '🔴 I\'m offline',
    },
    drv_btn_profile: {
        uz: '👤 Profilim',
        ru: '👤 Мой профиль',
        en: '👤 My profile',
    },
    drv_no_tasks: {
        uz: '📋 Hozircha sizga tayinlangan topshiriq yo\'q.',
        ru: '📋 Пока нет назначенных заданий.',
        en: '📋 No assigned tasks yet.',
    },
    drv_task_info: {
        uz: '🆕 <b>Topshiriq #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Hajm: {volume}\n📸 Rasm: {photo}\n\n🕐 {time}',
        ru: '🆕 <b>Задание #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Объём: {volume}\n📸 Фото: {photo}\n\n🕐 {time}',
        en: '🆕 <b>Task #{id}</b>\n\n👤 {name}\n📞 {phone}\n📍 {region}\n⚖️ Volume: {volume}\n📸 Photo: {photo}\n\n🕐 {time}',
    },
    drv_accepted: {
        uz: '✅ Topshiriq #{id} qabul qilindi!\n\nMijozga xabar yuborildi.',
        ru: '✅ Задание #{id} принято!\n\nКлиент уведомлён.',
        en: '✅ Task #{id} accepted!\n\nCustomer notified.',
    },
    drv_rejected: {
        uz: '❌ Topshiriq #{id} rad etildi.\n\nMasulga xabar yuborildi.',
        ru: '❌ Задание #{id} отклонено.\n\nОтветственный уведомлён.',
        en: '❌ Task #{id} rejected.\n\nSupervisor notified.',
    },
    drv_en_route: {
        uz: '🚚 Yo\'lga chiqdingiz!\n\nMijozga avtomatik xabar yuborildi.',
        ru: '🚚 Вы в пути!\n\nКлиент автоматически уведомлён.',
        en: '🚚 You\'re en route!\n\nCustomer notified automatically.',
    },
    drv_arrived: {
        uz: '📍 Yetib keldingiz!\n\nMijozga xabar yuborildi.\nEndi tortishni boshlang ⚖️',
        ru: '📍 Вы прибыли!\n\nКлиент уведомлён.\nНачните взвешивание ⚖️',
        en: '📍 You arrived!\n\nCustomer notified.\nStart weighing ⚖️',
    },
    drv_enter_weight: {
        uz: '⚖️ <b>Og\'irlikni kiriting (kg):</b>\n<i>Masalan: 45.5</i>',
        ru: '⚖️ <b>Введите вес (кг):</b>\n<i>Например: 45.5</i>',
        en: '⚖️ <b>Enter weight (kg):</b>\n<i>Example: 45.5</i>',
    },
    drv_enter_discount: {
        uz: '📉 <b>Chegirma foizini kiriting:</b>\n<i>0 — chegirmasiz, 10 — 10% chegirma</i>\n\nSabablar: namlik, ifloslik, yirtiqlik',
        ru: '📉 <b>Введите процент скидки:</b>\n<i>0 — без скидки, 10 — скидка 10%</i>\n\nПричины: влажность, загрязнение, повреждение',
        en: '📉 <b>Enter discount percent:</b>\n<i>0 — no discount, 10 — 10% discount</i>\n\nReasons: moisture, dirt, damage',
    },
    drv_calc_result: {
        uz: '🧮 <b>Hisob-kitob</b>\n\n⚖️ Og\'irlik: {weight} kg\n📉 Chegirma: {discount}%\n📊 Hisoblangan: {effective} kg\n💰 Narx: {price} so\'m/kg\n\n💵 <b>Jami: {total} so\'m</b>\n\nTasdiqlaysizmi?',
        ru: '🧮 <b>Расчёт</b>\n\n⚖️ Вес: {weight} кг\n📉 Скидка: {discount}%\n📊 Расчётный: {effective} кг\n💰 Цена: {price} сум/кг\n\n💵 <b>Итого: {total} сум</b>\n\nПодтверждаете?',
        en: '🧮 <b>Calculation</b>\n\n⚖️ Weight: {weight} kg\n📉 Discount: {discount}%\n📊 Effective: {effective} kg\n💰 Price: {price} UZS/kg\n\n💵 <b>Total: {total} UZS</b>\n\nConfirm?',
    },
    drv_collection_saved: {
        uz: '✅ <b>Hisob-kitob saqlandi!</b>\n\nMijoz tasdiqini kutamiz...',
        ru: '✅ <b>Расчёт сохранён!</b>\n\nОжидаем подтверждение клиента...',
        en: '✅ <b>Calculation saved!</b>\n\nWaiting for customer confirmation...',
    },
    drv_report: {
        uz: '📊 <b>Kunlik hisobot — {date}</b>\n\n🚛 Topshiriqlar: {tasks}\n✅ Bajarilgan: {completed}\n⚖️ Jami og\'irlik: {weight} kg\n💰 Jami summa: {amount} so\'m',
        ru: '📊 <b>Дневной отчёт — {date}</b>\n\n🚛 Заданий: {tasks}\n✅ Выполнено: {completed}\n⚖️ Общий вес: {weight} кг\n💰 Общая сумма: {amount} сум',
        en: '📊 <b>Daily report — {date}</b>\n\n🚛 Tasks: {tasks}\n✅ Completed: {completed}\n⚖️ Total weight: {weight} kg\n💰 Total amount: {amount} UZS',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN/MASUL BOT (adminBot) MATNLARI
    // ═══════════════════════════════════════════════════════════════════════

    adm_welcome: {
        uz: '👷 <b>Pack24 — Masul boti</b>\n\n5 raqamli kodingizni kiriting 👇\n<i>Admin bergan kod</i>',
        ru: '👷 <b>Pack24 — Бот ответственного</b>\n\nВведите 5-значный код 👇\n<i>Код от администратора</i>',
        en: '👷 <b>Pack24 — Supervisor Bot</b>\n\nEnter your 5-digit code 👇\n<i>Code from admin</i>',
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
    adm_btn_requests: {
        uz: '📋 Arizalar',
        ru: '📋 Заявки',
        en: '📋 Requests',
    },
    adm_btn_drivers: {
        uz: '👥 Haydovchilar',
        ru: '👥 Водители',
        en: '👥 Drivers',
    },
    adm_btn_payments: {
        uz: '💰 To\'lovlar',
        ru: '💰 Оплаты',
        en: '💰 Payments',
    },
    adm_btn_point: {
        uz: '🏭 Punkt boshqarish',
        ru: '🏭 Управление пунктом',
        en: '🏭 Point management',
    },
    adm_btn_report: {
        uz: '📊 Hisobotlar',
        ru: '📊 Отчёты',
        en: '📊 Reports',
    },
    adm_no_requests: {
        uz: '📋 Hozircha yangi ariza yo\'q.',
        ru: '📋 Пока нет новых заявок.',
        en: '📋 No new requests yet.',
    },
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
    adm_no_drivers: {
        uz: '❌ Hozircha online haydovchi yo\'q.',
        ru: '❌ Пока нет водителей онлайн.',
        en: '❌ No drivers online.',
    },
    adm_point_status: {
        uz: '🏭 <b>{name}</b>\n\n📍 Holat: {status}\n🕐 Ish vaqti: {hours}\n\nO\'zgartiring 👇',
        ru: '🏭 <b>{name}</b>\n\n📍 Статус: {status}\n🕐 Рабочее время: {hours}\n\nИзмените 👇',
        en: '🏭 <b>{name}</b>\n\n📍 Status: {status}\n🕐 Working hours: {hours}\n\nChange 👇',
    },
    adm_point_toggled: {
        uz: '✅ Punkt holati o\'zgartirildi: {status}',
        ru: '✅ Статус пункта изменён: {status}',
        en: '✅ Point status changed: {status}',
    },
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
    adm_payment_approved: {
        uz: '✅ To\'lov #{id} tasdiqlandi!',
        ru: '✅ Оплата #{id} подтверждена!',
        en: '✅ Payment #{id} approved!',
    },

    // ─── Umumiy (cross-bot) ──────────────────────────────────────────────
    notif_driver_assigned: {
        uz: '🚚 Sizga haydovchi tayinlandi!\n\n👤 {driver}\n📞 {phone}\n\nTez orada sizga qo\'ng\'iroq qiladi.',
        ru: '🚚 Вам назначен водитель!\n\n👤 {driver}\n📞 {phone}\n\nСкоро с вами свяжется.',
        en: '🚚 A driver has been assigned!\n\n👤 {driver}\n📞 {phone}\n\nWill contact you soon.',
    },
    notif_en_route: {
        uz: '🚚 Haydovchi <b>{driver}</b> yo\'lga chiqdi!\n\nTaxminiy vaqt: 15-30 daqiqa',
        ru: '🚚 Водитель <b>{driver}</b> выехал!\n\nПримерное время: 15-30 минут',
        en: '🚚 Driver <b>{driver}</b> is on the way!\n\nEstimated time: 15-30 minutes',
    },
    notif_arrived: {
        uz: '📍 Haydovchi <b>{driver}</b> yetib keldi!\n\nIltimos, makulaturani tayyorlang.',
        ru: '📍 Водитель <b>{driver}</b> прибыл!\n\nПожалуйста, подготовьте макулатуру.',
        en: '📍 Driver <b>{driver}</b> has arrived!\n\nPlease prepare your recyclables.',
    },
    notif_calc_confirm: {
        uz: '🧮 <b>Hisob-kitob tayyor!</b>\n\n⚖️ Og\'irlik: {weight} kg\n📉 Chegirma: {discount}%\n💵 <b>Jami: {total} so\'m</b>\n\nTasdiqlaysizmi?',
        ru: '🧮 <b>Расчёт готов!</b>\n\n⚖️ Вес: {weight} кг\n📉 Скидка: {discount}%\n💵 <b>Итого: {total} сум</b>\n\nПодтверждаете?',
        en: '🧮 <b>Calculation ready!</b>\n\n⚖️ Weight: {weight} kg\n📉 Discount: {discount}%\n💵 <b>Total: {total} UZS</b>\n\nConfirm?',
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
