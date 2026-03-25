'use client';

import Link from 'next/link';
import { Users, Phone, Mail, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const PACKAGING_MODELS = [
    {
        label: { uz: 'Karton quti', ru: 'Картонная коробка' },
        svg: (
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="10" y="22" width="40" height="30" rx="2" fill="rgba(96,165,250,0.3)" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
                <path d="M10 22 L30 14 L50 22" stroke="rgba(147,197,253,0.9)" strokeWidth="1.5" fill="rgba(59,130,246,0.2)"/>
                <path d="M30 14 L30 22" stroke="rgba(147,197,253,0.6)" strokeWidth="1" strokeDasharray="2 2"/>
                <path d="M10 22 L10 52 M50 22 L50 52" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
                <rect x="20" y="30" width="20" height="1.5" rx="1" fill="rgba(147,197,253,0.5)"/>
            </svg>
        ),
    },
    {
        label: { uz: 'Kuryer paketi', ru: 'Курьерский пакет' },
        svg: (
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="12" y="15" width="36" height="40" rx="3" fill="rgba(52,211,153,0.2)" stroke="rgba(110,231,183,0.8)" strokeWidth="1.5"/>
                <path d="M12 24 L48 24" stroke="rgba(110,231,183,0.7)" strokeWidth="1.5"/>
                <path d="M22 19.5 Q30 14 38 19.5" stroke="rgba(110,231,183,0.9)" strokeWidth="1.5" fill="none"/>
                <rect x="23" y="29" width="14" height="8" rx="2" fill="none" stroke="rgba(110,231,183,0.6)" strokeWidth="1"/>
                <path d="M26 33 H34" stroke="rgba(110,231,183,0.7)" strokeWidth="1"/>
            </svg>
        ),
    },
    {
        label: { uz: 'BOPP paket', ru: 'BOPP пакет' },
        svg: (
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M18 20 L18 52 Q18 55 30 55 Q42 55 42 52 L42 20 Q42 17 30 17 Q18 17 18 20 Z" fill="rgba(167,139,250,0.2)" stroke="rgba(196,181,253,0.8)" strokeWidth="1.5"/>
                <ellipse cx="30" cy="20" rx="12" ry="4" fill="rgba(139,92,246,0.3)" stroke="rgba(196,181,253,0.7)" strokeWidth="1.2"/>
                <path d="M22 12 L22 20 M38 12 L38 20" stroke="rgba(196,181,253,0.8)" strokeWidth="1.5"/>
                <path d="M22 12 Q30 9 38 12" stroke="rgba(196,181,253,0.9)" strokeWidth="1.5" fill="none"/>
                <path d="M24 35 H36" stroke="rgba(196,181,253,0.5)" strokeWidth="1" strokeDasharray="3 2"/>
            </svg>
        ),
    },
    {
        label: { uz: 'Yassi quti', ru: 'Плоская коробка' },
        svg: (
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="8" y="26" width="44" height="18" rx="2" fill="rgba(251,191,36,0.2)" stroke="rgba(252,211,77,0.8)" strokeWidth="1.5"/>
                <path d="M8 26 L18 18 L52 18 L52 26" fill="rgba(251,191,36,0.15)" stroke="rgba(252,211,77,0.7)" strokeWidth="1.2"/>
                <path d="M52 18 L52 36" stroke="rgba(252,211,77,0.5)" strokeWidth="1.2"/>
                <path d="M20 26 L20 44" stroke="rgba(252,211,77,0.4)" strokeWidth="1" strokeDasharray="2 2"/>
                <path d="M14 32 H46" stroke="rgba(252,211,77,0.4)" strokeWidth="1"/>
            </svg>
        ),
    },
    {
        label: { uz: 'Quvurli quti', ru: 'Тубус' },
        svg: (
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <ellipse cx="30" cy="15" rx="12" ry="4" fill="rgba(251,113,133,0.3)" stroke="rgba(252,165,165,0.8)" strokeWidth="1.5"/>
                <path d="M18 15 L18 48 Q18 52 30 52 Q42 52 42 48 L42 15" fill="rgba(251,113,133,0.15)" stroke="rgba(252,165,165,0.7)" strokeWidth="1.5"/>
                <ellipse cx="30" cy="49" rx="12" ry="4" fill="rgba(239,68,68,0.2)" stroke="rgba(252,165,165,0.6)" strokeWidth="1.2"/>
                <path d="M30 11 L30 15" stroke="rgba(252,165,165,0.7)" strokeWidth="1.5"/>
                <circle cx="30" cy="10" r="2" fill="rgba(252,165,165,0.8)"/>
            </svg>
        ),
    },
];

const DESIGN_TOOLS = [
    {
        href: '/design-tools/mockup',
        icon: '🖼️',
        title: { uz: 'Mockup Generator', ru: 'Mockup Generator' },
        desc: { uz: "Mahsulotingizni haqiqiy ko'rinishda namoyish eting", ru: 'Представьте продукт в реалистичном виде' },
        badge: { uz: 'Bepul', ru: 'Бесплатно' },
        badgeCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        borderCls: 'hover:border-emerald-400/40',
        iconBg: 'bg-emerald-500/15',
    },
    {
        href: '/design-tools/dieline',
        icon: '📐',
        title: { uz: 'Dieline Template', ru: 'Dieline Template' },
        desc: { uz: 'Quti uchun professional kesish shablonlari', ru: "Профессиональные шаблоны развёрток" },
        badge: { uz: 'PDF', ru: 'PDF' },
        badgeCls: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        borderCls: 'hover:border-blue-400/40',
        iconBg: 'bg-blue-500/15',
    },
    {
        href: '/design-tools/ai',
        icon: '🤖',
        title: { uz: 'AI Dizayn', ru: 'AI Дизайн' },
        desc: { uz: "Sun'iy intellekt yordamida avtomatik dizayn", ru: 'Автоматический дизайн с ИИ' },
        badge: { uz: 'Yangi', ru: 'Новинка' },
        badgeCls: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        borderCls: 'hover:border-purple-400/40',
        iconBg: 'bg-purple-500/15',
    },
];

const B2B_STATS = [
    { num: '-15%', label: { uz: 'Ulgurji chegirma', ru: 'Оптовая скидка' } },
    { num: '30',   label: { uz: 'Kun muddati',    ru: 'Дней рассрочки' } },
    { num: '24/7', label: { uz: "Qo'llab-quvvatlash", ru: 'Поддержка' } },
    { num: '1',    label: { uz: 'Shaxsiy menejer',  ru: 'Личный менеджер' } },
];

export default function ConfiguratorSection() {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const t = (uz: string, ru: string) => isRu ? ru : uz;

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-gradient-to-br from-[#0c2340] via-[#0f3460] to-[#16213e] rounded-3xl overflow-hidden relative">
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)] pointer-events-none" />

                <div className="relative z-10 p-6 lg:p-10">
                    <div className="flex flex-col xl:flex-row gap-10">

                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold text-blue-300">
                                    ✨ {t('3D Konfigurator', '3D Конфигуратор')}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                                    <Users size={11} /> {t('Korporativ hamkorlik', 'Корпоративное сотрудничество')}
                                </span>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3 leading-tight">
                                {t('Qadoqingizni loyihalang va buyurtma bering', 'Спроектируйте упаковку и сделайте заказ')}
                            </h2>
                            <p className="text-blue-200/80 text-sm mb-6 leading-relaxed">
                                {t(
                                    '3D modelni tanlang, rang va hajmni sozlang. Optom buyurtmalarda maxsus narxlar, kredit va shaxsiy menejer mavjud.',
                                    'Выберите 3D-модель, настройте цвет и размер. Для оптовых заказов — спеццены, рассрочка и личный менеджер.'
                                )}
                            </p>

                            {/* Packaging Models */}
                            <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">
                                {t('Qadoq modellari', 'Модели упаковки')}
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                                {PACKAGING_MODELS.map((model, i) => (
                                    <button
                                        key={i}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-105 ${
                                            i === 0
                                                ? 'border-blue-400/60 bg-blue-500/15'
                                                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        {model.svg}
                                        <span className="text-[10px] font-semibold text-blue-200/80 text-center leading-tight">
                                            {isRu ? model.label.ru : model.label.uz}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Colors + CTA */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex gap-2">
                                    {[
                                        { cls: 'bg-[#c8a97e]',   label: 'Kraft' },
                                        { cls: 'bg-white',       label: t('Oq', 'Белый') },
                                        { cls: 'bg-[#1e293b]',   label: t('Qora', 'Чёрный') },
                                        { cls: 'bg-blue-500',    label: t("Ko'k", 'Синий') },
                                        { cls: 'bg-emerald-500', label: t('Yashil', 'Зелёный') },
                                    ].map((c, i) => (
                                        <button
                                            key={i}
                                            title={c.label}
                                            aria-label={c.label}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${c.cls} ${i === 0 ? 'border-white' : 'border-white/30'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/catalog?filter=custom"
                                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 text-sm"
                                    >
                                        🎨 {t('Buyurtma berish', 'Заказать')}
                                    </Link>
                                    <a
                                        href="tel:+998712005683"
                                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 text-sm"
                                    >
                                        <Phone size={15} /> {t("Qo'ng'iroq", 'Позвонить')}
                                    </a>
                                    <a
                                        href="mailto:b2b@pack24.uz"
                                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
                                    >
                                        <Mail size={15} /> Email
                                    </a>
                                </div>
                            </div>

                            {/* Design tools */}
                            <div className="mt-6 pt-5 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                                        🎨 {t('Dizayn Asboblari', 'Инструменты Дизайна')}
                                    </p>
                                    <Link
                                        href="/design-tools"
                                        className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        {t('Barcha asboblar', 'Все инструменты')} <ChevronRight size={10} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {DESIGN_TOOLS.map((tool, i) => (
                                        <Link
                                            key={i}
                                            href={tool.href}
                                            className={`group flex flex-col gap-2 p-3 rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 ${tool.borderCls}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className={`w-9 h-9 ${tool.iconBg} rounded-lg flex items-center justify-center text-lg`}>
                                                    {tool.icon}
                                                </div>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tool.badgeCls}`}>
                                                    {isRu ? tool.badge.ru : tool.badge.uz}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                                                    {isRu ? tool.title.ru : tool.title.uz}
                                                </p>
                                                <p className="text-[10px] text-blue-200/60 leading-tight mt-0.5">
                                                    {isRu ? tool.desc.ru : tool.desc.uz}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: 3D Box + B2B Stats */}
                        <div className="shrink-0 flex flex-col items-center gap-6">
                            <div className="relative flex items-center justify-center w-48 h-48">
                                <div className="box-3d-wrapper flex items-center justify-center">
                                    <div className="box-3d">
                                        <div className="box-face box-front">
                                            <span className="text-3xl opacity-90">📦</span>
                                            <span className="text-[10px] font-bold text-white/80 mt-1 tracking-widest">PACK24</span>
                                        </div>
                                        <div className="box-face box-back" />
                                        <div className="box-face box-left" />
                                        <div className="box-face box-right" />
                                        <div className="box-face box-top" />
                                        <div className="box-face box-bottom" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-blue-500/30 rounded-full blur-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full max-w-[220px]">
                                {B2B_STATS.map(({ num, label }, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center border border-white/10">
                                        <p className="text-xl font-black text-white">{num}</p>
                                        <p className="text-[10px] text-blue-200/70 font-medium leading-tight mt-0.5">
                                            {isRu ? label.ru : label.uz}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
