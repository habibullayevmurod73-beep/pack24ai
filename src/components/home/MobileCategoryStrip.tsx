'use client';

import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translateCategory } from '@/lib/product-translations';

export default function MobileCategoryStrip() {
    const { language } = useLanguage();
    const categories = useCategoryStore((state) => state.categories);
    const activeCategories = categories.filter((c) => c.isActive);

    const ALL: Record<string, string> = {
        uz: 'Barchasi', ru: 'Все', en: 'All', qr: 'Barlıqı',
        zh: '全部', tr: 'Tümü', tg: 'Ҳамааш', kk: 'Барлығы', tk: 'Hemmesi', fa: 'همه',
    };
    const MORE: Record<string, string> = {
        uz: "Ko'proq", ru: 'Ещё', en: 'More', qr: 'Kóbirek',
        zh: '更多', tr: 'Daha fazla', tg: 'Бештар', kk: 'Көбірек', tk: 'Köpräk', fa: 'بیشتر',
    };

    return (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
                <div className="flex gap-2 px-4 py-3 w-max">
                    {/* Hammasini ko'rish */}
                    <Link href="/catalog" className="flex flex-col items-center gap-1 min-w-[64px]">
                        <div className="w-12 h-12 bg-[#0c2340] rounded-xl flex items-center justify-center shadow-sm">
                            <ChevronRight size={18} className="text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#0c2340] text-center whitespace-nowrap">
                            {ALL[language] ?? ALL.uz}
                        </span>
                    </Link>

                    {activeCategories.slice(0, 20).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div className="w-12 h-12 bg-gray-50 hover:bg-blue-50 rounded-xl flex items-center justify-center border border-gray-100 hover:border-blue-200 transition-colors shadow-sm">
                                <CategoryIcon name={cat.icon} className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight line-clamp-2 max-w-[64px]">
                                {translateCategory(cat.slug, language)}
                            </span>
                        </Link>
                    ))}

                    {/* Ko'proq */}
                    <Link href="/catalog" className="flex flex-col items-center gap-1 min-w-[64px]">
                        <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center border border-gray-200 transition-colors">
                            <Package size={18} className="text-gray-500" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 text-center whitespace-nowrap">
                            {MORE[language] ?? MORE.uz}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
