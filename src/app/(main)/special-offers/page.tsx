'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';
import { ChevronRight, Clock, ArrowRight, Sparkles, Tag } from 'lucide-react';

/* ── Offer data ── */
const OFFERS = [
    {
        id: 'startup',
        emoji: '🚀',
        gradient: 'from-purple-600 to-indigo-600',
        hoverShadow: 'hover:shadow-purple-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'Startap Paketi', ru: 'Стартап Пакет' },
        desc: {
            uz: 'Logo dizayni + 100 ta quti = maxsus narx! Biznesingizni professional qadoqlash bilan boshlang.',
            ru: 'Дизайн логотипа + 100 коробок = специальная цена! Начните свой бизнес с профессиональной упаковки.',
        },
        discount: '30%',
        discountLabel: { uz: '30% chegirma', ru: 'Скидка 30%' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
    {
        id: 'holiday',
        emoji: '🎁',
        gradient: 'from-pink-500 to-rose-500',
        hoverShadow: 'hover:shadow-pink-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'Bayram Qadoqlari', ru: 'Праздничная Упаковка' },
        desc: {
            uz: "Yangi yil va bayramlar uchun eksklyuziv dizaynlar. Bayram muhitini qadoqlash bilan yarating!",
            ru: 'Эксклюзивные дизайны для Нового года и праздников. Создайте праздничную атмосферу с упаковкой!',
        },
        discount: '20%',
        discountLabel: { uz: '20% chegirma', ru: 'Скидка 20%' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
    {
        id: 'wholesale',
        emoji: '📦',
        gradient: 'from-blue-500 to-cyan-500',
        hoverShadow: 'hover:shadow-blue-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'Optom Narxlar', ru: 'Оптовые Цены' },
        desc: {
            uz: "1000+ dona buyurtmada qo'shimcha 15% chegirma. Katta hajmda buyurtma bering — ko'proq tejang!",
            ru: 'Дополнительная скидка 15% при заказе от 1000+ шт. Заказывайте больше — экономьте больше!',
        },
        discount: '15%',
        discountLabel: { uz: '15% chegirma', ru: 'Скидка 15%' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
    {
        id: 'b2b',
        emoji: '🤝',
        gradient: 'from-emerald-500 to-teal-500',
        hoverShadow: 'hover:shadow-emerald-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'B2B Hamkorlik', ru: 'B2B Партнёрство' },
        desc: {
            uz: "Korxonalar uchun maxsus shartlar va individual narxlar. Uzoq muddatli hamkorlikda qo'shimcha imtiyozlar.",
            ru: 'Специальные условия и индивидуальные цены для предприятий. Дополнительные привилегии при долгосрочном сотрудничестве.',
        },
        discount: null,
        discountLabel: { uz: 'Individual', ru: 'Индивидуально' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
    {
        id: 'summer',
        emoji: '☀️',
        gradient: 'from-amber-500 to-orange-500',
        hoverShadow: 'hover:shadow-amber-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'Yoz Sezoni', ru: 'Летний Сезон' },
        desc: {
            uz: "Muzqaymoq va ichimliklar uchun qadoqlash yechimlari. Yozgi mahsulotlaringiz uchun ideal qadoq!",
            ru: 'Упаковочные решения для мороженого и напитков. Идеальная упаковка для ваших летних продуктов!',
        },
        discount: '25%',
        discountLabel: { uz: '25% chegirma', ru: 'Скидка 25%' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
    {
        id: 'newclient',
        emoji: '🌟',
        gradient: 'from-violet-500 to-purple-500',
        hoverShadow: 'hover:shadow-violet-200/60',
        badgeBg: 'bg-white/20',
        title: { uz: 'Yangi Mijoz', ru: 'Новый Клиент' },
        desc: {
            uz: "Birinchi buyurtmangizga 10% chegirma! Pack24 bilan tanishing va maxsus narxlardan foydalaning.",
            ru: 'Скидка 10% на первый заказ! Познакомьтесь с Pack24 и воспользуйтесь специальными ценами.',
        },
        discount: '10%',
        discountLabel: { uz: '10% chegirma', ru: 'Скидка 10%' },
        endDate: new Date('2026-07-31T23:59:59'),
    },
];

/* ── Countdown hook ── */
function useCountdown(endDate: Date) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calc = () => {
            const now = new Date().getTime();
            const diff = endDate.getTime() - now;
            if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        setTimeLeft(calc());
        const interval = setInterval(() => setTimeLeft(calc()), 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return timeLeft;
}

/* ── Countdown display ── */
function CountdownTimer({ endDate, t }: { endDate: Date; t: (uz: string, ru: string) => string }) {
    const { days, hours, minutes, seconds } = useCountdown(endDate);

    const blocks = [
        { value: days, label: t('kun', 'дн') },
        { value: hours, label: t('soat', 'ч') },
        { value: minutes, label: t('daq', 'мин') },
        { value: seconds, label: t('son', 'сек') },
    ];

    return (
        <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-white/70 shrink-0" />
            {blocks.map((b, i) => (
                <div key={i} className="flex items-center gap-1">
                    <span className="bg-black/20 backdrop-blur-sm text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        {String(b.value).padStart(2, '0')}
                    </span>
                    <span className="text-white/60 text-[10px]">{b.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Main page ── */
export default function SpecialOffersPage() {
    const { language } = useLanguage();
    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    return (
        <div className="min-h-screen bg-surface-page">
            {/* ── Breadcrumb ── */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        {t('Bosh sahifa', 'Главная')}
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">
                        {t('Maxsus takliflar', 'Спецпредложения')}
                    </span>
                </nav>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a3f6f] to-[#163860] p-8 sm:p-12 mb-10">
                    {/* Animated decorative elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                                <Sparkles size={14} />
                                {t("Cheklangan vaqt taklifi", "Ограниченное предложение")}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                                {t('Maxsus Takliflar', 'Спецпредложения')}
                            </h1>
                            <p className="text-blue-200/80 text-sm sm:text-base max-w-lg leading-relaxed">
                                {t(
                                    "Faqat cheklangan vaqt uchun amal qiladigan eng yaxshi narxlar va eksklyuziv shartlar. Imkoniyatni qo'ldan boy bermang!",
                                    'Лучшие цены и эксклюзивные условия, действующие ограниченное время. Не упустите возможность!'
                                )}
                            </p>
                        </div>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shrink-0"
                        >
                            {t("Katalogga o'tish", 'Перейти в каталог')}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* ── Offers Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {OFFERS.map((offer) => (
                        <Link
                            key={offer.id}
                            href="/catalog"
                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} ${offer.hoverShadow} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 block`}
                        >
                            {/* Large emoji decoration */}
                            <div className="absolute -right-4 -bottom-4 text-[120px] leading-none opacity-10 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                {offer.emoji}
                            </div>

                            <div className="relative z-10 p-6 flex flex-col h-full min-h-[280px]">
                                {/* Top row: emoji + discount badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl">{offer.emoji}</span>
                                    <span className={`inline-flex items-center gap-1 ${offer.badgeBg} backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                                        <Tag size={12} />
                                        {language === 'ru' ? offer.discountLabel.ru : offer.discountLabel.uz}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-extrabold text-white mb-2">
                                    {language === 'ru' ? offer.title.ru : offer.title.uz}
                                </h3>

                                {/* Description */}
                                <p className="text-white/80 text-sm leading-relaxed mb-4 flex-1">
                                    {language === 'ru' ? offer.desc.ru : offer.desc.uz}
                                </p>

                                {/* Countdown timer */}
                                <div className="mb-4">
                                    <CountdownTimer endDate={offer.endDate} t={t} />
                                </div>

                                {/* CTA button */}
                                <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all w-fit group-hover:bg-white/30">
                                    {t("Batafsil ko'rish", 'Подробнее')}
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="bg-gradient-to-br from-brand-navy to-[#163860] rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            {t("Barcha mahsulotlarimizni ko'ring", 'Посмотрите все наши продукты')}
                        </h3>
                        <p className="text-blue-200/80 text-sm">
                            {t(
                                "1000+ turdagi qadoqlash yechimlari — sizning biznesingiz uchun ideal tanlov.",
                                '1000+ видов упаковочных решений — идеальный выбор для вашего бизнеса.'
                            )}
                        </p>
                    </div>
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shrink-0"
                    >
                        {t("Katalogga o'tish", 'Перейти в каталог')}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
