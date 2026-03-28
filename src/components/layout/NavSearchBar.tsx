'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function NavSearchBar() {
    const { language } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState('');

    const PLACEHOLDERS: Record<string, string> = {
        uz: "Sayt bo'ylab qidiruv",
        ru: 'Поиск по сайту',
        en: 'Search products...',
        qr: "Qidiraw...",
        zh: '搜索产品…',
        tr: 'Ürün ara…',
        tg: 'ҷустӳҷӯи чизҳо',
        kk: 'Өнімдер іздеу',
        tk: 'Haryt gözle…',
        fa: 'جستجوی محصول…',
    };
    const placeholder = PLACEHOLDERS[language] ?? PLACEHOLDERS.uz;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            router.push(`/catalog?search=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex-grow w-full md:w-auto relative order-last md:order-none mt-2 md:mt-0"
        >
            <div className="flex h-[42px]">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    className="w-full border border-gray-300 rounded-l-md px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] bg-[#f8f8f8]"
                />
                <button
                    type="submit"
                    aria-label="Qidirish"
                    className="bg-gray-800 text-white px-4 rounded-r-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    );
}
