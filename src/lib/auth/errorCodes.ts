/**
 * Auth guard'lar uchun markaziy xato kodlari.
 *
 * Frontend/mobile ilova bu kodlarni parse qiladi, shuning uchun
 * ularni o'zboshimchalik bilan o'zgartirish mumkin emas.
 */
export const AUTH_ERROR_CODES = {
    /** Foydalanuvchi tizimga kirmagan */
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    /** Admin sifatida kirish talab etiladi */
    ADMIN_AUTH_REQUIRED: 'ADMIN_AUTH_REQUIRED',
    /** Admin token noto'g'ri yoki muddati o'tgan */
    ADMIN_TOKEN_INVALID: 'ADMIN_TOKEN_INVALID',
    /** ADMIN_SECRET env sozlanmagan */
    ADMIN_SECRET_MISSING: 'ADMIN_SECRET_MISSING',
    /** Haydovchi autentifikatsiyasi talab etiladi */
    DRIVER_AUTH_REQUIRED: 'DRIVER_AUTH_REQUIRED',
    /** Haydovchi hisobi faol emas */
    DRIVER_INACTIVE: 'DRIVER_INACTIVE',
    /** Bu amal uchun ruxsat yo'q */
    FORBIDDEN: 'FORBIDDEN',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
