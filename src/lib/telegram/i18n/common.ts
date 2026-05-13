// ─── Umumiy matnlar (barcha botlar uchun) ────────────────────────────────────
import type { Lang } from './index';

type Texts = Record<string, Record<Lang, string>>;

export const commonTexts: Texts = {
    // ─── /start va Ro'yxatdan o'tish ────────────────────────────────────
    welcome: {
        uz: '🏭 <b>Pack24 — Qadoqlash Yechimlari</b>\n\nAssalomu alaykum! Til tanlang 👇',
        ru: '🏭 <b>Pack24 — Упаковочные Решения</b>\n\nЗдравствуйте! Выберите язык 👇',
        en: '🏭 <b>Pack24 — Packaging Solutions</b>\n\nHello! Choose your language 👇',
    },

    // ─── Yangi ro'yxatdan o'tish oqimi ──────────────────────────────────
    reg_ask_phone: {
        uz: '📱 <b>Telefon raqamingizni yuboring</b>\n\nQuyidagi tugmani bosing yoki raqamni yozing:\n<i>Masalan: +998901234567</i>',
        ru: '📱 <b>Отправьте номер телефона</b>\n\nНажмите кнопку ниже или введите вручную:\n<i>Например: +998901234567</i>',
        en: '📱 <b>Send your phone number</b>\n\nTap the button below or type manually:\n<i>Example: +998901234567</i>',
    },
    reg_ask_name: {
        uz: '👤 <b>F.I.Sh. kiriting</b>\n\nIsmingiz va familiyangizni to\'liq yozing:\n<i>Masalan: Alisher Karimov</i>',
        ru: '👤 <b>Введите ФИО</b>\n\nВведите полное имя и фамилию:\n<i>Например: Алишер Каримов</i>',
        en: '👤 <b>Enter your Full Name</b>\n\nType your first and last name:\n<i>Example: Alisher Karimov</i>',
    },
    reg_code_sent: {
        uz: '🎉 <b>Tabriklaymiz, {name}!</b>\n\nSizning Pack24 shaxsiy kabinetingiz yaratildi.\n\n🔑 <b>Kirish kodi: <code>{code}</code></b>\n\n📱 Telefon: <b>{phone}</b>\n\n━━━━━━━━━━━━━━━━━━━━\n🌐 Shaxsiy kabinetga kirish:\n<b>pack24.ai</b> → Kirish → Telefon + Kod\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Ushbu kodni hech kimga bermang!',
        ru: '🎉 <b>Поздравляем, {name}!</b>\n\nВаш личный кабинет Pack24 создан.\n\n🔑 <b>Код входа: <code>{code}</code></b>\n\n📱 Телефон: <b>{phone}</b>\n\n━━━━━━━━━━━━━━━━━━━━\n🌐 Войти в личный кабинет:\n<b>pack24.ai</b> → Войти → Телефон + Код\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Не передавайте этот код никому!',
        en: '🎉 <b>Congratulations, {name}!</b>\n\nYour Pack24 personal cabinet has been created.\n\n🔑 <b>Login code: <code>{code}</code></b>\n\n📱 Phone: <b>{phone}</b>\n\n━━━━━━━━━━━━━━━━━━━━\n🌐 Access your cabinet:\n<b>pack24.ai</b> → Login → Phone + Code\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Never share this code!',
    },
    reg_already_exists: {
        uz: '👋 <b>Xush kelibsiz qaytadan, {name}!</b>\n\n📱 Telefon: <b>{phone}</b>\n🔑 Kirish kodingiz: <code>{code}</code>\n\n🌐 <b>pack24.ai</b> saytida shaxsiy kabinetingizga kiring.',
        ru: '👋 <b>С возвращением, {name}!</b>\n\n📱 Телефон: <b>{phone}</b>\n🔑 Ваш код входа: <code>{code}</code>\n\n🌐 Войдите в личный кабинет на <b>pack24.ai</b>',
        en: '👋 <b>Welcome back, {name}!</b>\n\n📱 Phone: <b>{phone}</b>\n🔑 Your login code: <code>{code}</code>\n\n🌐 Access your cabinet at <b>pack24.ai</b>',
    },
    reg_phone_taken: {
        uz: '❌ Bu telefon raqam allaqachon ro\'yxatdan o\'tgan.\n\n/start ni bosing va kabinetingizga kiring.',
        ru: '❌ Этот номер телефона уже зарегистрирован.\n\nНажмите /start для входа в кабинет.',
        en: '❌ This phone number is already registered.\n\nPress /start to access your cabinet.',
    },
    reg_name_too_short: {
        uz: '❌ Ism juda qisqa. Iltimos, to\'liq F.I.Sh. kiriting (kamida 3 harf).',
        ru: '❌ Имя слишком короткое. Пожалуйста, введите полное ФИО (минимум 3 символа).',
        en: '❌ Name is too short. Please enter your full name (at least 3 characters).',
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
