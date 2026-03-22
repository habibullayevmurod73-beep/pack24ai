'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useProductStore } from '@/lib/store/useProductStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ArrowRight, Package, Tag, TrendingUp, LayoutGrid } from 'lucide-react';

export default function CatalogIndexPage() {
    const { language } = useLanguage();
    const categories = useCategoryStore((s) => s.categories);
    const products = useProductStore((s) => s.products);
    const hasMounted = useHasMounted();

    const t = (uz: string, ru: string, en?: string) =>
        language === 'uz' ? uz : language === 'en' ? (en ?? ru) : ru;

    const activeCategories = categories.filter((c) => c.isActive).slice(0, 12);
    const totalProducts = products.length;
    const totalCategories = categories.filter((c) => c.isActive).length;

    if (!hasMounted) return null;

    const GRADIENTS = [
        'from-blue-50 to-blue-100',
        'from-emerald-50 to-emerald-100',
        'from-purple-50 to-purple-100',
        'from-orange-50 to-orange-100',
        'from-pink-50 to-pink-100',
        'from-teal-50 to-teal-100',
        'from-indigo-50 to-indigo-100',
        'from-yellow-50 to-yellow-100',
        'from-red-50 to-red-100',
        'from-cyan-50 to-cyan-100',
        'from-lime-50 to-lime-100',
        'from-violet-50 to-violet-100',
    ];

    return (
        <div className="space-y-8">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#102a45] to-[#163860] p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs font-semibold text-blue-200 mb-4">
                        <LayoutGrid size={12} />
                        {t("To'liq katalog", "Полный каталог")}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold mb-3">
                        {t("Qadoqlash materiallari", "Упаковочные материалы")}
                    </h1>
                    <p className="text-blue-100/80 text-sm mb-5 max-w-md">
                        {t(
                            "40 dan ortiq kategoriyada 5000+ mahsulot. Optom narxlar, tez yetkazib berish.",
                            "5000+ товаров в 40+ категориях. Оптовые цены, быстрая доставка."
                        )}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                            <Package size={16} className="text-emerald-300" />
                            <span><strong>{totalProducts || '5000'}+</strong> {t("mahsulot", "товаров")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                            <Tag size={16} className="text-blue-300" />
                            <span><strong>{totalCategories || '40'}+</strong> {t("kategoriya", "категорий")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                            <TrendingUp size={16} className="text-yellow-300" />
                            <span>{t("Optom narxlar", "Оптовые цены")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick categories grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {t("Ommabop kategoriyalar", "Популярные категории")}
                    </h2>
                    <span className="text-sm text-gray-500">
                        {t("Chap paneldan tanlang", "Выберите из левой панели")}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {activeCategories.map((cat, i) => {
                        const catName = cat.name[language as keyof typeof cat.name] || cat.name.ru;
                        const gradient = GRADIENTS[i % GRADIENTS.length];
                        return (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className={`group flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br ${gradient} hover:shadow-md transition-all duration-200 border border-white/60`}
                            >
                                <div className="w-9 h-9 bg-white/70 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <CategoryIcon name={cat.icon} className="w-5 h-5 text-gray-700" />
                                </div>
                                <span className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                                    {catName}
                                </span>
                                <ArrowRight size={12} className="text-gray-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                        {t("Kerakli mahsulotni topa olmadingizmi?", "Не нашли нужный товар?")}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t("Qidiruv orqali yoki menejer bilan bog'laning", "Воспользуйтесь поиском или свяжитесь с менеджером")}
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Link
                        href="/contacts"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                    >
                        {t("Bog'lanish", "Связаться")} <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
