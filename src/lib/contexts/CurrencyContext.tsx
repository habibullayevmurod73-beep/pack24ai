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

// ─── Fallback static kurslar (NBU API ishlamasa) ─────────────────────────────
const FALLBACK_RATES: Record<CurrencyCode, number> = {
    UZS: 1,
    USD: 1 / 12700,
    RUB: 1 / 141,
    EUR: 1 / 13800,
};

// ─── NBU API dan kurslarni olish ──────────────────────────────────────────────
// https://cbu.uz/uz/arkhiv-kursov-valyut/json/
async function fetchNbuRates(): Promise<Record<CurrencyCode, number>> {
    try {
        const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', {
            next: { revalidate: 86400 }, // 24 soat kesh
        });
        if (!res.ok) return FALLBACK_RATES;

        const data: { Ccy: string; Rate: string }[] = await res.json();
        const find = (ccy: string) => {
            const item = data.find(d => d.Ccy === ccy);
            return item ? parseFloat(item.Rate) : null;
        };

        const usdRate = find('USD');
        const rubRate = find('RUB');
        const eurRate = find('EUR');

        return {
            UZS: 1,
            USD: usdRate ? 1 / usdRate : FALLBACK_RATES.USD,
            RUB: rubRate ? 1 / rubRate : FALLBACK_RATES.RUB,
            EUR: eurRate ? 1 / eurRate : FALLBACK_RATES.EUR,
        };
    } catch {
        return FALLBACK_RATES;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    convert: (priceInUZS: number) => number;
    format: (priceInUZS: number) => string;
    symbol: string;
    rates: Record<CurrencyCode, number>;
    ratesLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('UZS');
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
    const [ratesLoading, setRatesLoading] = useState(true);

    // NBU API dan kurslarni yuklash
    useEffect(() => {
        const CACHE_KEY = 'pack24_nbu_rates';
        const CACHE_TS_KEY = 'pack24_nbu_rates_ts';
        const ONE_DAY = 24 * 60 * 60 * 1000;

        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTs = localStorage.getItem(CACHE_TS_KEY);
        const isExpired = !cachedTs || Date.now() - parseInt(cachedTs) > ONE_DAY;

        if (cached && !isExpired) {
            try {
                setRates(JSON.parse(cached));
                setRatesLoading(false);
                return;
            } catch { /* ignore parse errors */ }
        }

        fetchNbuRates().then(newRates => {
            setRates(newRates);
            setRatesLoading(false);
            localStorage.setItem(CACHE_KEY, JSON.stringify(newRates));
            localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        });
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('pack24_currency') as CurrencyCode | null;
        if (saved && saved in FALLBACK_RATES) setCurrencyState(saved);
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
            ratesLoading,
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
            rates: FALLBACK_RATES,
            ratesLoading: false,
        };
    }
    return ctx;
}
