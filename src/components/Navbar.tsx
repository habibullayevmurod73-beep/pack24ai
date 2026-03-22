
'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';


// Sub-komponentlar
import NavTopBar from './layout/NavTopBar';
import NavCatalogDropdown from './layout/NavCatalogDropdown';
import NavSearchBar from './layout/NavSearchBar';
import NavUserActions from './layout/NavUserActions';

const NAV_LINKS = [
    { href: '/',                 label: { uz: 'BOSH SAHIFA',     ru: 'ГЛАВНАЯ',          en: 'HOME' } },
    { href: '/delivery',         label: { uz: 'YETKAZISH',       ru: 'ДОСТАВКА',         en: 'DELIVERY' } },
    { href: '/payment',          label: { uz: "TO'LOV",          ru: 'ОПЛАТА',           en: 'PAYMENT' } },
    { href: '/discounts',        label: { uz: 'CHEGIRMA',        ru: 'СКИДКИ',           en: 'DISCOUNTS' } },
    { href: '/special-offers',   label: { uz: 'MAXSUS',          ru: 'СПЕЦПРЕДЛОЖЕНИЯ',  en: 'SPECIAL OFFERS' } },
    { href: '/recycling',        label: { uz: '♻️ QAYTA ISHLASH', ru: '♻️ ПЕРЕРАБОТКА',   en: '♻️ RECYCLING' } },
    { href: '/reviews',          label: { uz: 'SHARHLAR',        ru: 'ОТЗЫВЫ',           en: 'REVIEWS' } },
    { href: '/faq',              label: { uz: 'SAVOLLAR',        ru: 'ВОПРОСЫ',          en: 'FAQ' } },
    { href: '/active-vacancies', label: { uz: 'VAKANSIYALAR',    ru: 'ВАКАНСИИ',         en: 'VACANCIES' } },
    { href: '/contacts',         label: { uz: 'KONTAKTLAR',      ru: 'КОНТАКТЫ',         en: 'CONTACTS' } },
] as const;




export default function Navbar() {
    const { language } = useLanguage();
    const hasMounted = useHasMounted();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // SSR skeleton — hydration xatolarini oldini olish
    if (!hasMounted) {
        return (
            <nav className="bg-[#102a45] text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[70px]">
                        <span className="text-2xl font-black tracking-tighter">
                            PACK<span className="text-[#e33326]">24</span>
                        </span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <header className="font-sans flex flex-col w-full text-sm sticky top-0 z-50 shadow-md">
            {/* 1. Top info bar */}
            <NavTopBar />

            {/* 2. Main header: Logo + Catalog + Search + Actions */}
            <div className="bg-white py-4 md:py-5 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center mr-2" aria-label="Pack24 bosh sahifasi">
                        <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase relative">
                            PACK24 <span className="text-blue-600">AI</span>
                            <span className="absolute -bottom-1 right-0 text-[10px] font-normal text-gray-400 tracking-normal normal-case">
                                Hypermarket
                            </span>
                        </span>
                    </Link>

                    {/* Catalog dropdown */}
                    <NavCatalogDropdown />

                    {/* Search */}
                    <NavSearchBar />

                    {/* Online payment — hidden on small */}
                    <div className="hidden xl:block flex-shrink-0">
                        <Link
                            href="/payment"
                            className="text-[#e33326] border border-[#e33326] px-4 py-2.5 rounded text-[13px] font-bold uppercase hover:bg-[#e33326] hover:text-white transition-colors whitespace-nowrap"
                        >
                            {language === 'uz' ? "Onlayn To'lov" : "Онлайн-оплата"}
                        </Link>
                    </div>

                    {/* User: profile, favorites, cart */}
                    <NavUserActions />

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden ml-auto text-gray-700 hover:text-[#e33326] transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Menyu yopish' : 'Menyu ochish'}
                    >
                        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* 3. Desktop nav links */}
            <nav className="bg-white hidden md:block border-b-2 border-gray-100" aria-label="Asosiy navigatsiya">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-0 overflow-x-auto">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`font-bold text-[13px] py-4 px-3 lg:px-4 uppercase whitespace-nowrap transition-colors border-b-2 ${
                                        isActive
                                            ? 'text-[#e33326] border-[#e33326]'
                                            : 'text-[#102a45] hover:text-[#e33326] border-transparent'
                                    }`}
                                >
                                    {link.label[language as keyof typeof link.label] ?? link.label.en}
                                </Link>
                            );
                        })}

                    </div>
                </div>
            </nav>


            {/* 4. Mobile menu */}
            {mobileOpen && (
                <nav
                    className="md:hidden bg-white border-b border-gray-200 px-4 pb-4 animate-in slide-in-from-top-2 duration-200"
                    aria-label="Mobil navigatsiya"
                >
                    <ul className="flex flex-col space-y-1 mt-2">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between py-3 border-b border-gray-100 uppercase text-xs font-bold transition-colors ${
                                            isActive ? 'text-[#e33326]' : 'text-gray-700 hover:text-[#e33326]'
                                        }`}
                                    >
                                        {link.label[language as keyof typeof link.label] ?? link.label.en}
                                        {isActive && <span className="w-2 h-2 bg-[#e33326] rounded-full" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            )}
        </header>
    );
}
