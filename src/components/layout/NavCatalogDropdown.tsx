'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import * as LucideIcons from 'lucide-react';
import type { Language } from '@/lib/translations';
import { translateCategory } from '@/lib/product-translations';

type L = Record<Language, string>;

const LABEL: L = {
    uz: 'Katalog', ru: 'Каталог', en: 'Catalog', qr: 'Katalog',
    zh: '目录', tr: 'Katalog', tg: 'Каталог', kk: 'Каталог', tk: 'Katalog', fa: 'کاتالوگ',
};
const VIEW_ALL: L = {
    uz: "Barchasini ko'rish", ru: 'Смотреть все', en: 'View all', qr: "Barlıqın kóriw",
    zh: '查看全部', tr: 'Tümünü gör', tg: 'Ҳамаашро дидан', kk: 'Барлығын көру', tk: 'Hemmesini gör', fa: 'مشاهده همه',
};

export default function NavCatalogDropdown() {
    const { language } = useLanguage();
    const categories = useCategoryStore((state) => state.categories);

    return (
        <div className="relative group z-50">
            {/* Catalog Button */}
            <Link
                href="/catalog"
                className="hidden lg:flex items-center bg-[#e33326] text-white px-5 py-3 rounded text-[15px] font-bold uppercase hover:bg-[#c92d21] transition-colors gap-2 flex-shrink-0"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {LABEL[language] ?? LABEL.uz}
            </Link>

            {/* Dropdown */}
            <div className="absolute top-full left-0 w-[280px] bg-white shadow-xl rounded-b-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top pt-2">
                <div className="bg-white rounded-b-lg overflow-hidden">
                    {categories
                        .filter((c) => c.isActive)
                        .map((category) => {
                            const Icon =
                                category.icon && (LucideIcons as any)[category.icon]
                                    ? (LucideIcons as any)[category.icon]
                                    : LucideIcons.Box;

                            // Kategoriya nomi: translateCategory orqali 10 tilda
                            const catName = translateCategory(category.slug, language);

                            return (
                                <Link
                                    key={category.id}
                                    href={`/category/${category.slug}`}
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 text-gray-700 hover:text-[#e33326] transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <Icon size={18} className="text-gray-400" />
                                    <span className="font-medium text-[14px]">{catName}</span>
                                    <span className="ml-auto text-xs text-gray-300">{category.productCount}</span>
                                </Link>
                            );
                        })}

                    <Link
                        href="/catalog"
                        className="block text-center py-3 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 uppercase tracking-wide"
                    >
                        {VIEW_ALL[language] ?? VIEW_ALL.uz}
                    </Link>
                </div>
            </div>
        </div>
    );
}
