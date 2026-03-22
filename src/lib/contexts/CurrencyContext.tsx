'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type CurrencyCode = 'UZS' | 'USD' | 'RUB' | 'EUR';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; flag: string; name: string }> = {
    UZS: { symbol: "so'm", flag: '🇺🇿', name: 'O\'zbek so\'mi' },
    USD: { symbol: '$',    flag: '🇺🇸', name: 'US Dollar' },
    RUB: { symbol: '₽',   flag: '🇷🇺', name: 'Rus rubli' },
    EUR: { symbol: '€',   flag: '🇪🇺', name: 'Euro' },
};

// ─── Exchange rates (UZS asosida) ────────────────────────────────────────────
// Har kuni yangilanishi kerak (NBU API dan); hozir static
const BASE_RATES: Record<CurrencyCode, number> = {
    UZS: 1,
    USD: 1 / 12700,   // 1 USD = ~12,700 UZS
    RUB: 1 / 141,     // 1 RUB = ~141 UZS
    EUR: 1 / 13800,   // 1 EUR = ~13,800 UZS
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    convert: (priceInUZS: number) => number;
    format: (priceInUZS: number) => string;
    symbol: string;
    rates: Record<CurrencyCode, number>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('UZS');
    const [rates] = useState(BASE_RATES);

    useEffect(() => {
        const saved = localStorage.getItem('pack24_currency') as CurrencyCode | null;
        if (saved && saved in BASE_RATES) setCurrencyState(saved);
    }, []);

    const setCurrency = useCallback((c: CurrencyCode) => {
        setCurrencyState(c);
        localStorage.setItem('pack24_currency', c);
        // NavTopBar bilan sinxronlash uchun storage event
        window.dispatchEvent(new StorageEvent('storage', { key: 'pack24_currency', newValue: c }));
    }, []);

    const convert = useCallback((priceInUZS: number): number => {
        const rate = rates[currency];
        return priceInUZS * rate;
    }, [currency, rates]);

    const format = useCallback((priceInUZS: number): string => {
        const converted = convert(priceInUZS);
        const { symbol } = CURRENCY_CONFIG[currency];

        if (currency === 'UZS') {
            // UZS: 125,000 so'm
            return `${Math.round(converted).toLocaleString('ru-RU')} ${symbol}`;
        } else if (currency === 'RUB') {
            return `${Math.round(converted).toLocaleString('ru-RU')} ${symbol}`;
        } else {
            return `${symbol}${converted.toFixed(2)}`;
        }
    }, [currency, convert]);

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            convert,
            format,
            symbol: CURRENCY_CONFIG[currency].symbol,
            rates,
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
    return ctx;
}

// ─── Safe version (returns '' if not in provider) ─────────────────────────────
export function useCurrencySafe() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        return {
            currency: 'UZS' as CurrencyCode,
            setCurrency: () => {},
            convert: (p: number) => p,
            format: (p: number) => `${Math.round(p).toLocaleString('ru-RU')} so'm`,
            symbol: "so'm",
            rates: BASE_RATES,
        };
    }
    return ctx;
}
