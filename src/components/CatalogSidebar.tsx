'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { useCategoryStore, Category } from '@/lib/store/useCategoryStore';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

export default function CatalogSidebar() {
    const { language } = useLanguage();
    const pathname = usePathname();
    const categories = useCategoryStore((s) => s.categories);
    const activeCategories = categories.filter((c) => c.isActive);
    const [expanded, setExpanded] = useState<string | null>(null);

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    const getName = (cat: Category) =>
        cat.name[language as keyof typeof cat.name] ?? cat.name.uz;

    return (
        <nav className="w-[260px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start sticky top-[80px]">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[#0c2340] text-white">
                <LayoutGrid size={16} className="shrink-0" />
                <span className="font-bold text-sm tracking-wide uppercase">
                    {t('Barcha kategoriyalar', 'Все категории')}
                </span>
            </div>

            {/* Category list — scrollable */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <ul className="py-1">
                    {activeCategories.map((cat) => {
                        const hasChildren = !!cat.children?.length;
                        const isExpanded = expanded === cat.id;
                        const isActive = pathname === `/category/${cat.slug}`;

                        return (
                            <li key={cat.id}>
                                {/* Parent row */}
                                <div className={`flex items-center gap-2 px-3 py-[7px] group cursor-pointer transition-colors
                                    ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    {/* Icon */}
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors
                                        ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                        <CategoryIcon name={cat.icon} className={`w-3 h-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                    </div>

                                    {/* Name — link or expand */}
                                    {hasChildren ? (
                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : cat.id)}
                                            className={`flex-1 text-left text-[13px] font-medium leading-tight truncate
                                                ${isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}
                                        >
                                            {getName(cat)}
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className={`flex-1 text-[13px] font-medium leading-tight truncate
                                                ${isActive ? 'text-blue-700' : 'text-gray-700 hover:text-gray-900'}`}
                                        >
                                            {getName(cat)}
                                        </Link>
                                    )}

                                    {/* Arrow */}
                                    {hasChildren ? (
                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : cat.id)}
                                            aria-label={isExpanded ? 'Yopish' : 'Ochish'}
                                            className={`text-gray-400 hover:text-gray-600 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                                        >
                                            <ChevronRight size={13} />
                                        </button>
                                    ) : (
                                        <ChevronRight size={11} className="text-gray-300 shrink-0 group-hover:text-gray-400" />
                                    )}
                                </div>

                                {/* Sub-categories */}
                                {hasChildren && isExpanded && (
                                    <ul className="border-l-2 border-blue-100 ml-5 mb-0.5">
                                        {cat.children!.map((sub) => {
                                            const subActive = pathname === `/category/${sub.slug}`;
                                            return (
                                                <li key={sub.id}>
                                                    <Link
                                                        href={`/category/${sub.slug}`}
                                                        className={`flex items-center gap-1.5 px-3 py-[5px] text-xs transition-colors
                                                            ${subActive
                                                                ? 'text-blue-600 font-semibold bg-blue-50'
                                                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-60" />
                                                        {getName(sub)}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                        <li>
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="flex items-center gap-1.5 px-3 py-[5px] text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                                            >
                                                <ChevronDown size={10} />
                                                {t("Barchasini ko'rish", 'Смотреть все')}
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Footer: full catalog */}
                <div className="px-3 py-2.5 border-t border-gray-100">
                    <Link
                        href="/catalog"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-[#0c2340] hover:bg-[#102a45] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        <LayoutGrid size={12} />
                        {t("To'liq katalog", 'Полный каталог')}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
