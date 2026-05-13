// ─── Cross-bot bildirishnomalar ──────────────────────────────────────────────
import type { Lang } from './index';

type Texts = Record<string, Record<Lang, string>>;

export const notificationTexts: Texts = {
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
