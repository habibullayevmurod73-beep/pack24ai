'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useState } from 'react';
import {
    Phone, Mail, MapPin, Clock, Send,
    Instagram, MessageCircle, ArrowRight,
    Package, Truck, Star, Users
} from 'lucide-react';

// ─── Footer linklari ──────────────────────────────────────────────
const FOOTER_LINKS = {
    info: {
        uz: "Ma'lumot", ru: 'Информация', en: 'Info',
        links: [
            { href: '/delivery',    uz: 'Yetkazish',       ru: 'Доставка' },
            { href: '/payment',     uz: "To'lov",           ru: 'Оплата' },
            { href: '/reviews',     uz: 'Sharhlar',         ru: 'Отзывы' },
            { href: '/discounts',   uz: 'Chegirmalar',      ru: 'Скидки' },
            { href: '/contacts',    uz: 'Kontaktlar',       ru: 'Контакты' },
        ],
    },
    catalog: {
        uz: 'Katalog', ru: 'Каталог', en: 'Catalog',
        links: [
            { href: '/catalog',         uz: 'Barcha mahsulotlar',    ru: 'Все товары' },
            { href: '/special-offers',  uz: 'Maxsus takliflar',      ru: 'Спецпредложения' },
            { href: '/catalog?new=1',   uz: 'Yangiliklar',           ru: 'Новинки' },
            { href: '/recycling',       uz: '♻️ Qayta ishlash',      ru: '♻️ Переработка' },
            { href: '/faq',             uz: "Ko'p so'raladigan",     ru: 'Вопросы' },
            { href: '/active-vacancies',uz: 'Vakansiyalar',          ru: 'Вакансии' },
        ],
    },
    tools: {
        uz: 'Dizayn Asboblari', ru: 'Инструменты', en: 'Design Tools',
        links: [
            { href: '/tools',                  uz: 'Barcha asboblar',   ru: 'Все инструменты' },
            { href: '/tools/mockup-generator', uz: 'Mockup Generator',  ru: 'Генератор мокапов' },
            { href: '/tools/dieline',          uz: 'Dieline Template',  ru: 'Шаблоны раскройки' },
            { href: '/tools/ai-design',        uz: 'AI Dizayn',         ru: 'AI Дизайн' },
            { href: '/configurator',           uz: '3D Konfigurator',   ru: '3D Конфигуратор' },
        ],
    },
} as const;

// ─── Statistika ──────────────────────────────────────────────────
const STATS = [
    { icon: Users,   uz: '150 000+ mijoz',        ru: '150 000+ клиентов',     en: '150 000+ clients' },
    { icon: Package, uz: '10 000+ mahsulot',       ru: '10 000+ товаров',       en: '10 000+ products' },
    { icon: Truck,   uz: 'O\'z kuni yetkazish',    ru: 'Доставка в день заказа',en: 'Same-day delivery' },
    { icon: Star,    uz: '11 yil tajriba',          ru: '11 лет опыта',          en: '11 years experience' },
];

// ─── Yetkazish kompaniyalari ──────────────────────────────────────
const DELIVERY_COMPANIES = ['СДЭК', 'ПЭК', 'Деловые Линии', 'DPD', 'Почта России', 'Яндекс', 'Байкал'];

// ─── To'lov usullari ──────────────────────────────────────────────
const PAYMENT_METHODS = [
    { label: 'Visa',   bg: 'bg-blue-600' },
    { label: 'MC',     bg: 'bg-red-500' },
    { label: 'UzCard', bg: 'bg-green-600' },
    { label: 'Humo',   bg: 'bg-purple-600' },
    { label: 'Click',  bg: 'bg-blue-400' },
    { label: 'Payme',  bg: 'bg-indigo-500' },
    { label: 'Uzum',   bg: 'bg-orange-500' },
];

export default function Footer() {
    const { language } = useLanguage();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const t = (uz: string, ru: string, en?: string) =>
        language === 'uz' ? uz : language === 'en' ? (en ?? ru) : ru;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    return (
        <footer className="bg-[#0c1a2e] text-white">


            {/* ── Callback CTA strip ── */}
            <div className="bg-[#102a45] border-b border-white/10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-white">
                            {t("Savollaringizga javob beramiz!", "Ответим на ваши вопросы!", "We'll answer your questions!")}
                        </p>
                        <p className="text-sm text-blue-200/70">
                            {t("Ish vaqtida 5 daqiqada qayta qo'ng'iroq qilamiz.", "Перезвоним в течение 5 минут в рабочее время.", "We'll call back within 5 minutes during business hours.")}
                        </p>
                    </div>
                    <Link
                        href="/contacts"
                        className="flex-shrink-0 bg-[#e33326] hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                    >
                        {t("Qayta qo'ng'iroq", "Перезвоните мне", "Call me back")}
                    </Link>
                </div>
            </div>

            {/* ── Main footer body ── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">

                    {/* Brand + contacts */}
                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <span className="text-2xl font-black tracking-tighter">
                                PACK<span className="text-[#e33326]">24</span>
                                <span className="text-blue-400 ml-1 text-lg">AI</span>
                            </span>
                            <p className="text-blue-200/60 text-xs mt-1 font-medium">
                                {t("Qadoqlash materiallari gipermaketi", "Гипермаркет упаковочных материалов", "Packaging materials hypermarket")}
                            </p>
                        </div>

                        <div className="space-y-2.5 text-sm">
                            <a href="tel:+998712345678" className="flex items-center gap-2.5 text-blue-100 hover:text-white transition-colors">
                                <Phone size={14} className="text-blue-400 shrink-0" />
                                <span>+998 71 234-56-78</span>
                            </a>
                            <a href="tel:+998935678901" className="flex items-center gap-2.5 text-blue-100 hover:text-white transition-colors">
                                <Phone size={14} className="text-blue-400 shrink-0" />
                                <span>+998 93 567-89-01</span>
                            </a>
                            <a href="mailto:sales@pack24.uz" className="flex items-center gap-2.5 text-blue-100 hover:text-white transition-colors">
                                <Mail size={14} className="text-blue-400 shrink-0" />
                                <span>sales@pack24.uz</span>
                            </a>
                            <div className="flex items-start gap-2.5 text-blue-100">
                                <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                <span>{t("Toshkent, Oybek ko'chasi 14", "Ташкент, ул. Айбека 14", "Tashkent, Aybek str. 14")}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-blue-100">
                                <Clock size={14} className="text-blue-400 shrink-0" />
                                <span>{t("Har kuni 8:00 – 21:00", "Ежедневно с 8:00 до 21:00", "Daily 8:00 – 21:00")}</span>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex gap-2 mt-5">
                            {[
                                { icon: Instagram,      label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
                                { icon: Send,           label: 'Telegram',  href: '#', color: 'hover:bg-blue-500' },
                                { icon: MessageCircle,  label: 'WhatsApp',  href: '#', color: 'hover:bg-green-600' },
                            ].map(({ icon: Icon, label, href, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className={`w-9 h-9 bg-white/10 ${color} rounded-xl flex items-center justify-center transition-colors`}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav link columns */}
                    {Object.entries(FOOTER_LINKS).map(([key, section]) => (
                        <div key={key}>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-200/60 mb-4">
                                {language === 'ru' ? section.ru : language === 'en' ? section.en : section.uz}
                            </h3>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-blue-100/80 hover:text-white transition-colors"
                                        >
                                            {language === 'ru' ? link.ru : link.uz}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Newsletter ── */}
                <div className="mt-10 pt-8 border-t border-white/10">
                    <div className="bg-gradient-to-br from-[#102a45] to-[#0e2038] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p className="font-bold text-white mb-1">
                                {t("Yangiliklar va chegirmalardan xabardor bo'ling", "Узнавайте о новинках и скидках", "Get notified about news and discounts")}
                            </p>
                            <p className="text-sm text-blue-200/60">
                                {t("Haftalik yangiliklar, maxsus takliflar va chegirmalar", "Еженедельные новости, спецпредложения и скидки", "Weekly news, special offers and discounts")}
                            </p>
                        </div>
                        {subscribed ? (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl text-sm font-semibold flex-shrink-0">
                                ✓ {t("Obuna bo'ldingiz!", "Вы подписались!", "You're subscribed!")}
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto flex-shrink-0">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("Email manzilingiz", "Ваш email", "Your email")}
                                    required
                                    className="flex-1 md:w-60 bg-white/10 border border-white/20 text-white placeholder-blue-200/40 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#e33326] hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap"
                                >
                                    {t("Obuna", "Подписаться", "Subscribe")}
                                    <ArrowRight size={14} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── Delivery companies ── */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200/40 mb-3">
                        {t("Yetkazish kompaniyalari", "Транспортные компании", "Delivery partners")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {DELIVERY_COMPANIES.map((name) => (
                            <span key={name} className="text-xs bg-white/5 border border-white/10 text-blue-200/60 px-3 py-1.5 rounded-lg font-medium">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Payment methods ── */}
                <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200/40 mb-3">
                        {t("To'lov usullari", "Способы оплаты", "Payment methods")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {PAYMENT_METHODS.map(({ label, bg }) => (
                            <span key={label} className={`${bg} text-white text-xs font-extrabold px-3 py-1.5 rounded-lg`}>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Copyright ── */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-200/40">
                    <p>© Pack24 AI — {t("Qadoqlash materiallari gipermaketi", "Гипермаркет упаковочных материалов", "Packaging materials hypermarket")}, 2015–{new Date().getFullYear()}</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-blue-200 transition-colors">{t("Maxfiylik siyosati", "Политика конфиденциальности", "Privacy Policy")}</Link>
                        <Link href="/offer" className="hover:text-blue-200 transition-colors">{t("Ommaviy oferta", "Публичная оферта", "Public Offer")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
