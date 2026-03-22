'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
    Recycle, MapPin, Phone, CheckCircle, ChevronDown, ChevronUp,
    ArrowRight, Truck, Package, Leaf, Building2, Scale,
    Factory, Star, ShieldCheck, Clock, Send
} from 'lucide-react';
import { toast } from 'sonner';

// ─── 12 ta viloyat ma'lumotlari ────────────────────────────────────────────
const REGIONS = [
    { id: 1, uz: 'Toshkent (HQ)',   ru: 'Ташкент (HQ)',      city: { uz: 'Toshkent shahri',   ru: 'г. Ташкент' },     phone: '+998 71 234-56-78', status: 'active',  color: 'bg-emerald-500' },
    { id: 2, uz: 'Samarqand',       ru: 'Самарканд',          city: { uz: 'Samarqand sh.',      ru: 'г. Самарканд' },   phone: '+998 93 234-56-78', status: 'planned', color: 'bg-blue-500'    },
    { id: 3, uz: 'Buxoro',          ru: 'Бухара',             city: { uz: 'Buxoro sh.',         ru: 'г. Бухара' },      phone: '+998 93 345-67-89', status: 'planned', color: 'bg-purple-500'  },
    { id: 4, uz: "Qashqadaryo",     ru: 'Кашкадарья',        city: { uz: 'Qarshi sh.',         ru: 'г. Карши' },       phone: '+998 93 456-78-90', status: 'planned', color: 'bg-orange-500'  },
    { id: 5, uz: 'Surxandaryo',     ru: 'Сурхандарья',       city: { uz: 'Termiz sh.',         ru: 'г. Термез' },      phone: '+998 93 567-89-01', status: 'planned', color: 'bg-red-500'    },
    { id: 6, uz: 'Navoiy',          ru: 'Навои',              city: { uz: 'Navoiy sh.',         ru: 'г. Навои' },       phone: '+998 93 678-90-12', status: 'planned', color: 'bg-teal-500'    },
    { id: 7, uz: 'Namangan',        ru: 'Наманган',           city: { uz: 'Namangan sh.',       ru: 'г. Наманган' },    phone: '+998 93 789-01-23', status: 'planned', color: 'bg-indigo-500'  },
    { id: 8, uz: 'Andijon',         ru: 'Андижан',            city: { uz: 'Andijon sh.',        ru: 'г. Андижан' },     phone: '+998 93 890-12-34', status: 'planned', color: 'bg-pink-500'    },
    { id: 9, uz: "Farg'ona",        ru: 'Фергана',            city: { uz: "Farg'ona sh.",       ru: 'г. Фергана' },     phone: '+998 93 901-23-45', status: 'planned', color: 'bg-cyan-500'    },
    { id: 10, uz: 'Xorazm',         ru: 'Хорезм',             city: { uz: 'Urganch sh.',        ru: 'г. Ургенч' },      phone: '+998 93 012-34-56', status: 'planned', color: 'bg-lime-500'    },
    { id: 11, uz: 'Sirdaryo',       ru: 'Сырдарья',          city: { uz: 'Guliston sh.',       ru: 'г. Гулистан' },    phone: '+998 93 123-45-67', status: 'planned', color: 'bg-yellow-500'  },
    { id: 12, uz: 'Jizzax',         ru: 'Джизак',             city: { uz: 'Jizzax sh.',         ru: 'г. Джизак' },      phone: '+998 93 234-56-79', status: 'planned', color: 'bg-violet-500'  },
];

// ─── Qabul qilinadigan materiallar ─────────────────────────────────────────
const MATERIALS = [
    { emoji: '📰', uz: 'Gazeta va jurnallar',          ru: 'Газеты и журналы',            price: '800–1 200' },
    { emoji: '📄', uz: 'Ofis qog\'ozi (A4 va boshqa)', ru: 'Офисная бумага (А4 и др.)',   price: '1 000–1 500' },
    { emoji: '📦', uz: 'Karton va gofrokarton',        ru: 'Картон и гофрокартон',        price: '600–1 000' },
    { emoji: '📚', uz: 'Kitob va darsliklar',          ru: 'Книги и учебники',             price: '700–1 100' },
    { emoji: '🗂️', uz: 'Arxiv hujjatlar',              ru: 'Архивные документы',           price: '900–1 300' },
    { emoji: '🧻', uz: 'Qadoqlash qog\'ozi',           ru: 'Упаковочная бумага',          price: '500–900'  },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────
const FAQ = [
    {
        uz: { q: 'Makulaturani qanday topshiraman?', a: 'Siz makulaturangizni eng yaqin bazamizga olib kelishingiz yoki biz sizga kuryer jo\'natishimiz mumkin. Minimal miqdor: 50 kg.' },
        ru: { q: 'Как сдать макулатуру?',             a: 'Вы можете привезти макулатуру на ближайшую базу или мы пришлём курьера. Минимальный объём: 50 кг.' },
    },
    {
        uz: { q: 'To\'lov qachon amalga oshiriladi?', a: 'To\'lov qabul qilingan kuni, og\'irlik tarozida aniqlanganidan keyin naqd yoki karta orqali amalga oshiriladi.' },
        ru: { q: 'Когда производится оплата?',        a: 'Оплата производится в день приёма, после взвешивания — наличными или на карту.' },
    },
    {
        uz: { q: 'Minimal qabul miqdori qancha?',    a: 'Bas\'dan topshirishda minimal miqdor 50 kg. Kuryer chiqarishimiz uchun minimal 200 kg bo\'lishi kerak.' },
        ru: { q: 'Какой минимальный объём приёма?',  a: 'Минимальный объём при сдаче на базе — 50 кг. Для вызова курьера — от 200 кг.' },
    },
    {
        uz: { q: 'Bazadan mahsulot sotib olish mumkinmi?', a: 'Ha, barcha bazalarimizda gofra karton qutilar va katalogdagi barcha mahsulotlar mavjud. Optom narxlarda.' },
        ru: { q: 'Можно ли купить товары на базе?',        a: 'Да, на всех наших базах доступны гофрокартонные коробки и все товары каталога. По оптовым ценам.' },
    },
    {
        uz: { q: 'Kuryer xizmati pullik emasmi?', a: "200 kg dan ortiq bo'lsa kuryer xizmati bepul. 50–199 kg uchun yetkazib berish narxi alohida kelishiladi." },
        ru: { q: 'Курьер бесплатный?',             a: 'При объёме от 200 кг вывоз курьером бесплатен. От 50 до 199 кг — стоимость доставки согласовывается отдельно.' },
    },
];

// ─── Jarayon qadamlari ──────────────────────────────────────────────────────
const STEPS = [
    { icon: Phone,    color: 'bg-blue-500',    uz: 'Murojaat qiling',        ru: 'Оставьте заявку',         desc: { uz: 'Telefon yoki forma orqali so\'rov yuboring', ru: 'Позвоните или заполните форму' } },
    { icon: Truck,    color: 'bg-emerald-500', uz: 'Kuryer keladi',           ru: 'Приедет курьер',           desc: { uz: 'Biz yoki siz eng yaqin bazaga olib kelasiz', ru: 'Мы или вы доставляете на ближайшую базу' } },
    { icon: Scale,    color: 'bg-purple-500',  uz: 'Tortib to\'laymiz',       ru: 'Взвешиваем и платим',      desc: { uz: "Og'irlik aniqlanadi va darhol to'lov", ru: 'Определяем вес и сразу платим' } },
    { icon: Recycle,  color: 'bg-orange-500',  uz: 'Qayta ishlanadi',         ru: 'Перерабатывается',         desc: { uz: "Makulatura preslash va qayta ishlash zavodiga yo'naltiriladi", ru: 'Макулатура прессуется и отправляется на завод' } },
];

// ─── Afzalliklar ─────────────────────────────────────────────────────────────
const BENEFITS = [
    { icon: Star,      color: 'text-yellow-500', uz: 'Raqobatbardosh narxlar',       ru: 'Конкурентные цены',       desc: { uz: 'Bozordagi eng yuqori narxlarda qabul qilamiz', ru: 'Принимаем по лучшим рыночным ценам' } },
    { icon: Clock,     color: 'text-blue-500',   uz: 'Tez xizmat',                   ru: 'Быстрое обслуживание',    desc: { uz: '24 soat ichida kuryer chiqaramiz', ru: 'Курьер в течение 24 часов' } },
    { icon: ShieldCheck, color: 'text-emerald-500', uz: 'Ishonchli to\'lov',          ru: 'Надёжная оплата',         desc: { uz: "Naqd yoki karta — so'zsiz to'laymiz", ru: 'Наличными или на карту — без вопросов' } },
    { icon: Leaf,      color: 'text-green-500',  uz: 'Ekologik mas\'uliyat',          ru: 'Экологическая ответственность', desc: { uz: 'Har 1 tonna makulatura — 17 ta daraxt saqlanadi', ru: 'Каждая тонна спасает 17 деревьев' } },
    { icon: Building2, color: 'text-purple-500', uz: '12 viloyat tarmog\'i',          ru: 'Сеть в 12 регионах',      desc: { uz: "O'zbekiston bo'ylab keng tarmoq", ru: 'Широкая сеть по всему Узбекистану' } },
    { icon: Package,   color: 'text-orange-500', uz: 'Tayyor mahsulot sotish',        ru: 'Продажа готовых товаров', desc: { uz: 'Gofra qutular va katalog — bazada ham mavjud', ru: 'Гофрокороба и каталог — доступно на базе' } },
];

export default function RecyclingPage() {
    const { language } = useLanguage();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', volume: '', material: '', pickup: 'base' });

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim() || !selectedRegion) {
            toast.error(t("Barcha maydonlarni to'ldiring", 'Заполните все поля'));
            return;
        }
        setSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));
        setSubmitting(false);
        setSubmitted(true);
        toast.success(t("So'rovingiz qabul qilindi! Tez orada bog'lanamiz.", 'Заявка принята! Скоро свяжемся.'));
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa]">

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                <div className="absolute right-12 bottom-4 text-[180px] opacity-[0.06] select-none pointer-events-none leading-none">♻️</div>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-200 mb-6">
                            <Recycle size={14} />
                            {t("Yangi yo'nalish — Qayta Ishlash Tarmog'i", 'Новое направление — Сеть переработки')}
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
                            {language === 'ru' ? (
                                <>Сдайте макулатуру — <span className="text-emerald-300">получите деньги</span></>
                            ) : (
                                <>Makulatura topshiring — <span className="text-emerald-300">pul oling</span></>
                            )}
                        </h1>
                        <p className="text-lg text-emerald-100/80 mb-8 max-w-xl leading-relaxed">
                            {t(
                                "O'zbekistonning 12 viloyatida makulatura yig'ish bazalari. Qog'oz, karton va gofrokarton chiqindilarni qabul qilamiz — siz topasiz, biz olib ketamiz.",
                                "Базы сбора макулатуры в 12 регионах Узбекистана. Принимаем бумагу, картон, гофрокартон. Вы собираете — мы забираем."
                            )}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {[
                                { num: '12', label: { uz: 'Viloyat',          ru: 'Регионов' } },
                                { num: '500+', label: { uz: "Mijoz/oy",       ru: 'Клиентов/мес' } },
                                { num: '24h', label: { uz: 'Kuryer chiqishi', ru: 'Вывоз курьера' } },
                                { num: '0 UZS', label: { uz: 'Minimal to\'siq', ru: 'Минимальный порог' } },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                                    <p className="text-2xl font-black text-white">{s.num}</p>
                                    <p className="text-xs text-emerald-200/70 mt-0.5">{language === 'ru' ? s.label.ru : s.label.uz}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <a href="#form" className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                                <Recycle size={18} />
                                {t("Makulatura topshirish", 'Сдать макулатуру')}
                            </a>
                            <a href="#regions" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5">
                                <MapPin size={18} />
                                {t("Yaqin bazani topish", 'Найти ближайшую базу')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">{t("Qanday ishlaydi?", 'Как это работает?')}</h2>
                    <p className="text-gray-500 mt-2">{t("4 oddiy qadam — pul ishlang va atrof-muhitni saqlang", '4 простых шага — зарабатывайте и защищайте природу')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={i} className="relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 -right-3 z-10">
                                        <ArrowRight size={20} className="text-gray-300" />
                                    </div>
                                )}
                                <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-md`}>
                                    <Icon size={22} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('Qadam', 'Шаг')} {i + 1}</span>
                                <h3 className="text-lg font-extrabold text-gray-900 mt-1 mb-2">{t(step.uz, step.ru)}</h3>
                                <p className="text-sm text-gray-500">{t(step.desc.uz, step.desc.ru)}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── CIRCULAR ECONOMY BANNER ──────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2">
                            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold text-emerald-100 mb-4">
                                <Leaf size={12} /> {t("Aylanma iqtisodiyot", 'Циркулярная экономика')}
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-extrabold mb-4">
                                {t("Chiqindidan — yangi mahsulotgacha", 'От отходов — к новому продукту')}
                            </h2>
                            <p className="text-emerald-100/80 leading-relaxed max-w-xl">
                                {t(
                                    "Siz topshirgan makulatura preslash orqali qayta ishlash zavodiga jo'natilib, yangi karton va qog'oz mahsulotlari ishlab chiqariladi. Bu mahsulotlar yana bizning katalogimizda paydo bo'ladi — aylanma tsikl to'liq bo'ladi.",
                                    "Сданная вами макулатура прессуется и отправляется на перерабатывающий завод для производства новых картонных изделий. Эти изделия вновь появляются в нашем каталоге — так замыкается цикл."
                                )}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { emoji: '🌳', uz: '1 tonna = 17 ta daraxt saqlanadi',   ru: '1 тонна = 17 спасённых деревьев' },
                                { emoji: '💧', uz: '1 tonna = 26 000 L suv tejash',       ru: '1 тонна = экономия 26 000 л воды' },
                                { emoji: '⚡', uz: '1 tonna = 4 000 kWh energiya tejash', ru: '1 тонна = 4 000 кВт•ч электроэнергии' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-medium">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span>{t(item.uz, item.ru)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MATERIALS WE ACCEPT ──────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{t("Nima qabul qilamiz?", 'Что принимаем?')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t("Narxlar 1 kg uchun, so'mda", 'Цены за 1 кг, в сумах')}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        <CheckCircle size={12} /> {t("Barcha holatlarda qabul", 'Принимаем в любом состоянии')}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MATERIALS.map((mat, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="text-4xl shrink-0">{mat.emoji}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900">{t(mat.uz, mat.ru)}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{t('Narx:', 'Цена:')} <span className="text-emerald-600 font-bold">{mat.price} {t("so'm/kg", 'сум/кг')}</span></p>
                            </div>
                            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    * {t("Aniq narxlar hajm va material turiga qarab farqlanishi mumkin. Operator bilan aniqlashtiring.", 'Точные цены зависят от объёма и типа материала. Уточняйте у оператора.')}
                </p>
            </section>

            {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
            <section className="bg-white py-16">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">{t("Nima uchun Pack24?", 'Почему Pack24?')}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFITS.map((b, i) => {
                            const Icon = b.icon;
                            return (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className={`w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center shrink-0`}>
                                        <Icon size={22} className={b.color} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{t(b.uz, b.ru)}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{t(b.desc.uz, b.desc.ru)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 12 REGIONS ───────────────────────────────────────────────────── */}
            <section id="regions" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">{t("12 Viloyat — Bizning Tarmog'imiz", '12 Регионов — Наша Сеть')}</h2>
                    <p className="text-gray-500 mt-2">{t("Har bir viloyatda makulatura qabul va mahsulot sotish bazasi", 'В каждом регионе — база приёма макулатуры и продажи товаров')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {REGIONS.map((r) => (
                        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all group">
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md`}>
                                    {r.id}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-gray-900">{t(r.uz, r.ru)}</p>
                                    <p className="text-xs text-gray-400">{t(r.city.uz, r.city.ru)}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {r.status === 'active' ? t('Faol', 'Активно') : t('Tez orada', 'Скоро')}
                                </span>
                            </div>
                            <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                <Phone size={12} />
                                {r.phone}
                            </a>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex items-center gap-1 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                                    <Recycle size={10} className="text-emerald-500" />
                                    {t('Makulatura', 'Макулатура')}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                                    <Package size={10} className="text-blue-500" />
                                    {t('Mahsulot', 'Товары')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── REQUEST FORM ─────────────────────────────────────────────────── */}
            <section id="form" className="bg-gradient-to-br from-[#0c2340] to-[#163860] py-16">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left text */}
                        <div className="text-white">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-3 py-1 text-xs font-bold text-emerald-300 mb-6">
                                <Factory size={12} /> {t("Makulatura topshirish", 'Сдача макулатуры')}
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                                {t("So'rov yuboring — biz bog'lanamiz", "Оставьте заявку — мы свяжемся")}
                            </h2>
                            <p className="text-blue-200/70 leading-relaxed mb-8">
                                {t(
                                    "Formani to'ldiring, viloyatingizni tanlang. Biz 2 soat ichida siz bilan bog'lanamiz va makulaturani olib ketish uchun qulay vaqtni kelishamiz.",
                                    "Заполните форму, выберите регион. Мы свяжемся с вами в течение 2 часов и согласуем удобное время вывоза."
                                )}
                            </p>
                            <div className="space-y-3">
                                {[
                                    { icon: CheckCircle, uz: '100 000 so\'mgacha darhol to\'lov',  ru: 'Оплата до 100 000 сум сразу' },
                                    { icon: CheckCircle, uz: 'Katta hajmlar uchun bank o\'tkazma', ru: 'Банковский перевод для больших объёмов' },
                                    { icon: CheckCircle, uz: 'Hujjatlashtirish (yuridik shaxslar)', ru: 'Документальное оформление (юрлица)' },
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 text-sm text-blue-100">
                                            <Icon size={16} className="text-emerald-400 shrink-0" />
                                            {t(item.uz, item.ru)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-3xl p-8 shadow-2xl">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={40} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                                        {t("So'rovingiz qabul qilindi! 🎉", 'Заявка принята! 🎉')}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        {t("2 soat ichida siz bilan bog'lanamiz.", 'Свяжемся с вами в течение 2 часов.')}
                                    </p>
                                    <button
                                        onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', volume: '', material: '', pickup: 'base' }); setSelectedRegion(''); }}
                                        className="text-sm font-semibold text-blue-600 hover:underline"
                                    >
                                        {t("Yana so'rov yuborish", 'Отправить ещё заявку')}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h3 className="text-lg font-extrabold text-gray-900 mb-5">
                                        {t("Makulatura topshirish uchun so'rov", 'Заявка на сдачу макулатуры')}
                                    </h3>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="recycling-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                                {t('Ism Familiya', 'Имя Фамилия')} *
                                            </label>
                                            <input
                                                id="recycling-name"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder={t("Sizning ismingiz", 'Ваше имя')}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="recycling-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                                {t('Telefon', 'Телефон')} *
                                            </label>
                                            <input
                                                id="recycling-phone"
                                                value={form.phone}
                                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                type="tel"
                                                placeholder="+998 90 123-45-67"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="recycling-region" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                            {t('Viloyat / Baza', 'Регион / База')} *
                                        </label>
                                        <select
                                            id="recycling-region"
                                            value={selectedRegion}
                                            onChange={e => setSelectedRegion(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white transition-colors"
                                        >
                                            <option value="">{t('Viloyatni tanlang...', 'Выберите регион...')}</option>
                                            {REGIONS.map(r => (
                                                <option key={r.id} value={r.id}>{t(r.uz, r.ru)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="recycling-material" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                                {t('Material turi', 'Тип материала')}
                                            </label>
                                            <select
                                                id="recycling-material"
                                                value={form.material}
                                                onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                                            >
                                                <option value="">{t('Tanlang...', 'Выберите...')}</option>
                                                {MATERIALS.map((m, i) => <option key={i} value={m.uz}>{t(m.uz, m.ru)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="recycling-volume" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                                {t("Taxminiy hajm (kg)", 'Примерный объём (кг)')}
                                            </label>
                                            <input
                                                id="recycling-volume"
                                                value={form.volume}
                                                onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                                                placeholder="e.g. 200"
                                                type="number"
                                                min="50"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("Topshirish usuli", 'Способ сдачи')}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'base',   uz: '🏭 Bazaga olib kelaman',   ru: '🏭 Привезу на базу' },
                                                { id: 'pickup', uz: '🚛 Kuryer olsin',            ru: '🚛 Курьер заберёт' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, pickup: opt.id }))}
                                                    className={`text-sm font-semibold p-3 rounded-xl border-2 text-left transition-all ${form.pickup === opt.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-100 text-gray-700 hover:border-gray-300'}`}
                                                >
                                                    {t(opt.uz, opt.ru)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-200"
                                    >
                                        <Send size={16} />
                                        {submitting ? t("Yuborilmoqda...", 'Отправка...') : t("So'rov yuborish", 'Отправить заявку')}
                                    </button>
                                    <p className="text-center text-[11px] text-gray-400">
                                        {t("Ma'lumotlaringiz maxfiy saqlanadi", 'Ваши данные надёжно защищены')}
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRODUCTS AT BASES ─────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">{t("Bazalarimizda mahsulot sotib oling", 'Купите товары на наших базах')}</h2>
                    <p className="text-gray-500 mt-2">{t("Makulatura topshiring va darhol kerakli qadoqlash mahsulotlarini olib keting", 'Сдайте макулатуру и сразу заберите нужную упаковку')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { emoji: '📦', color: 'from-blue-500 to-indigo-600',    uz: { title: 'Gofra Karton Qutilar',          desc: 'Barcha o\'lcham va markalar. Optom narxda.' },                  ru: { title: 'Гофрокартонные коробки',           desc: 'Все размеры и марки. По оптовым ценам.' } },
                        { emoji: '🛍️', color: 'from-emerald-500 to-teal-600',  uz: { title: 'Paketlar va Kuryer Qoplari',     desc: 'BOPP, Zip-lock, kuryer paketlar va boshqalar.' },              ru: { title: 'Пакеты и курьерские конверты',     desc: 'БОПП, Зип-лок, курьерские пакеты и другие.' } },
                        { emoji: '🔧', color: 'from-orange-500 to-red-500',     uz: { title: 'Qadoqlash aksessuarlari',        desc: 'Skotch, streich plyonka, lenta va boshqalar.' },               ru: { title: 'Расходные материалы',              desc: 'Скотч, стрейч-плёнка, лента и другое.' } },
                    ].map((item, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl group cursor-pointer">
                            <div className={`bg-gradient-to-br ${item.color} p-8 text-white min-h-[200px] flex flex-col justify-between transition-transform group-hover:scale-[1.02]`}>
                                <div className="text-5xl mb-4">{item.emoji}</div>
                                <div>
                                    <h3 className="text-xl font-extrabold mb-2">{t(item.uz.title, item.ru.title)}</h3>
                                    <p className="text-white/80 text-sm">{t(item.uz.desc, item.ru.desc)}</p>
                                </div>
                            </div>
                            <Link href="/catalog" className="absolute inset-0 flex items-end p-6">
                                <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                                    {t("Katalogga o'tish", 'Перейти в каталог')} <ArrowRight size={12} />
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────────── */}
            <section className="bg-white py-16">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900">{t("Tez-tez beriladigan savollar", 'Часто задаваемые вопросы')}</h2>
                        </div>
                        <div className="space-y-3">
                            {FAQ.map((faq, i) => {
                                const item = language === 'ru' ? faq.ru : faq.uz;
                                const isOpen = openFaq === i;
                                return (
                                    <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between px-6 py-4 text-left"
                                        >
                                            <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                                            {isOpen ? <ChevronUp size={18} className="text-emerald-500 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center pointer-events-none select-none">♻️</div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold mb-4">{t("Bugun makulatura topshiring!", 'Сдайте макулатуру сегодня!')}</h2>
                        <p className="text-emerald-100/80 mb-8 max-w-xl mx-auto">
                            {t("Mintaqangizdagi bazamizga murojaat qiling. Sizning chiqindingiz — bizning resursimiz!", 'Обратитесь на нашу базу в вашем регионе. Ваши отходы — наш ресурс!')}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href="#form" className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-8 py-3.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg">
                                <Recycle size={18} />{t("So'rov yuborish", 'Отправить заявку')}
                            </a>
                            <a href="tel:+998712345678" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
                                <Phone size={18} />+998 71 234-56-78
                            </a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
