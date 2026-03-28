'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import type { Language } from '@/lib/translations';

type L = Record<Language, string>;

const FEATURES: { icon: string; title: L; sub: L; color: string }[] = [
    {
        icon: '🚚',
        title: { uz: 'Tez yetkazish', ru: 'Быстрая доставка', en: 'Fast Delivery', qr: 'Tez jetkeriwshi', zh: '快速配送', tr: 'Hızlı Teslimat', tg: 'Тавзеи тез', kk: 'Жедел жеткізу', tk: 'Çalt eltip bermek', fa: 'تحویل سریع' },
        sub:  { uz: "O'z kuni", ru: 'В день заказа', en: 'Same day', qr: 'Siparis kuni', zh: '当天送达', tr: 'Sipariş günü', tg: 'Рӯзи фармоиш', kk: 'Тапсырыс күні', tk: 'Sargyt günü', fa: 'در روز سفارش' },
        color: 'bg-blue-50 border-blue-100',
    },
    {
        icon: '💳',
        title: { uz: "Xavfsiz to'lov", ru: 'Безопасная оплата', en: 'Secure Payment', qr: "Xawipsiz tólew", zh: '安全支付', tr: 'Güvenli Ödeme', tg: 'Пардохти бехатар', kk: 'Қауіпсіз төлем', tk: 'Howpsuz töleg', fa: 'پرداخت امن' },
        sub:  { uz: 'Onlayn / naqd', ru: 'Онлайн / наличные', en: 'Online / cash', qr: 'Onlayn / naqt', zh: '在线/现金', tr: 'Online / nakit', tg: 'Онлайн / нақд', kk: 'Онлайн / қолма-қол', tk: 'Onlaýn / nagt', fa: 'آنلاین / نقد' },
        color: 'bg-emerald-50 border-emerald-100',
    },
    {
        icon: '🏆',
        title: { uz: 'Sifat kafolati', ru: 'Гарантия качества', en: 'Quality Guarantee', qr: 'Sapa kepilligi', zh: '质量保证', tr: 'Kalite Garantisi', tg: 'Кафолати сифат', kk: 'Сапа кепілдігі', tk: 'Hil kepilligi', fa: 'ضمانت کیفیت' },
        sub:  { uz: 'Sertifikatlangan', ru: 'Сертифицировано', en: 'Certified', qr: 'Sertifikatlangan', zh: '已认证', tr: 'Sertifikalı', tg: 'Сертификатсия шудааст', kk: 'Сертификатталған', tk: 'Sertifisirlenilen', fa: 'گواهی‌شده' },
        color: 'bg-yellow-50 border-yellow-100',
    },
    {
        icon: '📦',
        title: { uz: 'Katta assortiment', ru: 'Большой ассортимент', en: 'Huge Range', qr: 'Uly assortiment', zh: '大量商品', tr: 'Geniş Ürün Yelpazesi', tg: 'Ассортименти васеъ', kk: 'Кең ассортимент', tk: 'Uly assortiment', fa: 'محدوده گسترده' },
        sub:  { uz: '40+ kategoriya', ru: '40+ категорий', en: '40+ categories', qr: '40+ kategoriya', zh: '40+类别', tr: '40+ kategori', tg: '40+ категория', kk: '40+ санат', tk: '40+ kategoriýa', fa: '۴۰+ دسته‌بندی' },
        color: 'bg-purple-50 border-purple-100',
    },
    {
        icon: '💰',
        title: { uz: 'Optom narxlar', ru: 'Оптовые цены', en: 'Wholesale Prices', qr: 'Optom bahalar', zh: '批发价格', tr: 'Toptan Fiyatlar', tg: 'Нархҳои яклухт', kk: 'Көтерме бағалар', tk: 'Lomaý bahalar', fa: 'قیمت عمده' },
        sub:  { uz: '100+ dona uchun', ru: 'От 100 штук', en: 'From 100 pcs', qr: '100+ dana úshin', zh: '100件起', tr: '100 adetten itibaren', tg: 'Аз 100 дона', kk: '100 данадан', tk: '100 sanydan', fa: 'از ۱۰۰ عدد' },
        color: 'bg-orange-50 border-orange-100',
    },
    {
        icon: '🎨',
        title: { uz: 'Brending', ru: 'Брендирование', en: 'Branding', qr: 'Brending', zh: '品牌定制', tr: 'Markalama', tg: 'Брендинг', kk: 'Брендинг', tk: 'Brending', fa: 'برندسازی' },
        sub:  { uz: 'Logotip bilan', ru: 'С логотипом', en: 'With logo', qr: 'Logotip menen', zh: '带Logo', tr: 'Logo ile', tg: 'Бо логотип', kk: 'Логотиппен', tk: 'Logotip bilen', fa: 'با لوگو' },
        color: 'bg-pink-50 border-pink-100',
    },
];

export default function FeatureCards() {
    const { language } = useLanguage();

    return (
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {FEATURES.map((item) => (
                        <div
                            key={item.title.uz}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${item.color} hover:shadow-sm transition-shadow cursor-default`}
                        >
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 leading-tight truncate">
                                    {item.title[language] ?? item.title.uz}
                                </p>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    {item.sub[language] ?? item.sub.uz}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
