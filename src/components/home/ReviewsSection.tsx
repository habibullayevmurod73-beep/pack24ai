'use client';

import Link from 'next/link';
import { Star, ChevronRight, ArrowRight, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const REVIEWS = [
    {
        name: { uz: 'Aziz Toshmatov', ru: 'Азиз Тошматов' },
        role: { uz: 'Savdo kompaniyasi', ru: 'Торговая компания' },
        text: {
            uz: "Pack24 dan 3 yildan beri xarid qilamiz. Sifat va tezkorlik ajoyib! Har safar kutilgan muddat oldidan yetkazib berishadi.",
            ru: "Покупаем у Pack24 уже 3 года. Качество и скорость — отличные! Всегда доставляют раньше срока.",
        },
        rating: 5, avatar: 'A', color: 'bg-blue-500',
    },
    {
        name: { uz: 'Malika Yusupova', ru: 'Малика Юсупова' },
        role: { uz: 'Restoran egasi', ru: 'Владелица ресторана' },
        text: {
            uz: "Oshxonamiz uchun qadoq materiallarini shu yerdan olamiz. Narxlar bozordan 20% arzon, sifat esa yuqori!",
            ru: "Берём упаковочные материалы для ресторана здесь. Цены на 20% ниже рынка, качество отличное!",
        },
        rating: 5, avatar: 'M', color: 'bg-emerald-500',
    },
    {
        name: { uz: 'Jasur Rahimov', ru: 'Жасур Рахимов' },
        role: { uz: "Online do'kon", ru: 'Интернет-магазин' },
        text: {
            uz: "Bulk import funksiyasi hayotimni osonlashtirdi. 500 ta mahsulotni bir vaqtda yuklab oldim. Juda qulay platforma!",
            ru: "Функция массового импорта облегчила жизнь. Загрузил 500 товаров за раз. Очень удобная платформа!",
        },
        rating: 5, avatar: 'J', color: 'bg-purple-500',
    },
];

export default function ReviewsSection() {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {isRu ? 'Отзывы клиентов' : 'Mijozlar sharhlari'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isRu ? 'Мнения реальных покупателей' : 'Haqiqiy mijozlarning fikrlari'}
                    </p>
                </div>
                <Link
                    href="/reviews"
                    className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                    {isRu ? 'Все отзывы' : 'Barcha sharhlar'} <ChevronRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {REVIEWS.map((review, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="flex gap-0.5 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={16}
                                    className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                                />
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <Quote size={32} className="text-blue-100 absolute -top-1 -left-1 pointer-events-none" />
                            <p className="text-sm text-gray-700 leading-relaxed relative z-10">
                                {isRu ? review.text.ru : review.text.uz}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                            <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {review.avatar}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">
                                    {isRu ? review.name.ru : review.name.uz}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {isRu ? review.role.ru : review.role.uz}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Link
                    href="/reviews"
                    className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl text-sm transition-all duration-200"
                >
                    {isRu ? 'Смотреть все отзывы' : "Barcha sharhlarni ko'rish"} <ArrowRight size={15} />
                </Link>
            </div>
        </section>
    );
}
