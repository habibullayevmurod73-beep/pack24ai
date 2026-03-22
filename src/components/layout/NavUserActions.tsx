'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCurrencySafe, CURRENCY_CONFIG, CurrencyCode } from '@/lib/contexts/CurrencyContext';
import { ShoppingCart, Heart, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const CURRENCIES: CurrencyCode[] = ['UZS', 'USD', 'RUB', 'EUR'];

export default function NavUserActions() {
    const { language } = useLanguage();
    const hasMounted = useHasMounted();
    const { isAuthenticated, user } = useAuthStore();
    const cartCount = useCartStore(
        (state) => state.items.reduce((sum, item) => sum + item.quantity, 0)
    );
    const { currency, setCurrency } = useCurrencySafe();
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loginLabel = language === 'uz' ? 'Kirish' : language === 'ru' ? 'Войти' : 'Login';

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCurrencyOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const cfg = CURRENCY_CONFIG[currency];

    return (
        <div className="flex items-center space-x-3 lg:space-x-5 text-gray-600 flex-shrink-0">

            {/* ── Currency selector ── */}
            {hasMounted && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setCurrencyOpen(!currencyOpen)}
                        className="flex items-center gap-1 text-[13px] font-bold text-gray-700 hover:text-[#e33326] transition-colors"
                        aria-label="Valyuta tanlash"
                    >
                        <span>{cfg.flag}</span>
                        <span>{currency}</span>
                        <ChevronDown
                            size={12}
                            className={`transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {currencyOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            {CURRENCIES.map((code) => {
                                const c = CURRENCY_CONFIG[code];
                                const isActive = code === currency;
                                return (
                                    <button
                                        key={code}
                                        onClick={() => { setCurrency(code); setCurrencyOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                                            isActive
                                                ? 'bg-[#e33326]/5 text-[#e33326] font-bold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <span className="text-base">{c.flag}</span>
                                        <span className="font-semibold">{code}</span>
                                        <span className="text-gray-400 text-xs ml-auto">{c.symbol}</span>
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#e33326] flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Profile / Login */}
            {hasMounted && isAuthenticated ? (
                <Link
                    href="/profile"
                    className="flex flex-col items-center group"
                    aria-label="Profil"
                >
                    <User
                        size={24}
                        strokeWidth={1.5}
                        className="text-emerald-700 group-hover:text-emerald-900 transition-colors"
                    />
                    <span className="text-[10px] mt-1 font-medium text-emerald-700 leading-none">
                        {user?.name.split(' ')[0]}
                    </span>
                </Link>
            ) : (
                <Link
                    href="/login"
                    className="flex flex-col items-center group"
                    aria-label={loginLabel}
                >
                    <User
                        size={24}
                        strokeWidth={1.5}
                        className="group-hover:text-[#e33326] transition-colors"
                    />
                    <span className="text-[10px] mt-1 group-hover:text-[#e33326] transition-colors leading-none">
                        {loginLabel}
                    </span>
                </Link>
            )}

            {/* Favorites */}
            <button
                className="flex flex-col items-center group relative"
                aria-label="Sevimlilar"
            >
                <Heart
                    size={24}
                    strokeWidth={1.5}
                    className="group-hover:text-[#e33326] transition-colors"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-[#e33326] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    0
                </span>
            </button>

            {/* Cart */}
            <Link
                href="/cart"
                className="flex flex-col items-center group relative"
                aria-label="Savat"
            >
                <div className="relative">
                    <ShoppingCart
                        size={24}
                        strokeWidth={1.5}
                        className="group-hover:text-[#e33326] transition-colors"
                    />
                    {hasMounted && cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#e33326] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-in zoom-in">
                            {cartCount}
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
