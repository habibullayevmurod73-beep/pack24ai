'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';

const FEATURES = [
    {
        icon: '🚚',
        uz: 'Tez yetkazish', ru: 'Быстрая доставка',
        sub: { uz: "O'z kuni", ru: 'В день заказа' },
        color: 'bg-blue-50 border-blue-100',
    },
    {
        icon: '💳',
        uz: "Xavfsiz to'lov", ru: 'Безопасная оплата',
        sub: { uz: 'Onlayn / naqd', ru: 'Онлайн / наличные' },
        color: 'bg-emerald-50 border-emerald-100',
    },
    {
        icon: '🏆',
        uz: 'Sifat kafolati', ru: 'Гарантия качества',
        sub: { uz: 'Sertifikatlangan', ru: 'Сертифицировано' },
        color: 'bg-yellow-50 border-yellow-100',
    },
    {
        icon: '📦',
        uz: 'Katta assortiment', ru: 'Большой ассортимент',
        sub: { uz: '40+ kategoriya', ru: '40+ категорий' },
        color: 'bg-purple-50 border-purple-100',
    },
    {
        icon: '💰',
        uz: 'Optom narxlar', ru: 'Оптовые цены',
        sub: { uz: '100+ dona uchun', ru: 'От 100 штук' },
        color: 'bg-orange-50 border-orange-100',
    },
    {
        icon: '🎨',
        uz: 'Brending', ru: 'Брендирование',
        sub: { uz: 'Logotip bilan', ru: 'С логотипом' },
        color: 'bg-pink-50 border-pink-100',
    },
] as const;

export default function FeatureCards() {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    return (
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {FEATURES.map((item) => (
                        <div
                            key={item.uz}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${item.color} hover:shadow-sm transition-shadow cursor-default`}
                        >
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 leading-tight truncate">
                                    {isRu ? item.ru : item.uz}
                                </p>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    {isRu ? item.sub.ru : item.sub.uz}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
