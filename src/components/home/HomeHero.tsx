'use client';

import Link from 'next/link';
import Image from 'next/image';
import CatalogSidebar from '@/components/CatalogSidebar';
import HeroBannerSlider from '@/components/HeroBannerSlider';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useProductStore } from '@/lib/store/useProductStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function HomeHero() {
    const { language } = useLanguage();
    const categories = useCategoryStore((state) => state.categories);
    const products = useProductStore((state) => state.products);

    const activeCategories = categories.filter((c) => c.isActive);
    const t = (uz: string, ru: string) => language === 'uz' ? uz : ru;

    const categoryCards = activeCategories
        .map((cat) => {
            const catSlugs = new Set([
                cat.slug,
                ...(cat.children?.map((c) => c.slug) ?? []),
            ]);
            const catProducts = products.filter(
                (p) => p.status === 'active' && p.category && catSlugs.has(p.category)
            );
            if (catProducts.length === 0) return null;
            const rep = catProducts.find((p) => p.isFeatured) ?? catProducts[0];
            return { cat, rep, count: catProducts.length };
        })
        .filter(Boolean) as {
            cat: typeof activeCategories[0];
            rep: (typeof products)[0];
            count: number;
        }[];

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
            <div className="flex gap-5 items-start">
                {/* Left: Catalog Sidebar */}
                <div className="hidden lg:block shrink-0">
                    <CatalogSidebar />
                </div>

                {/* Right: Banner + Category Showcase */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div className="rounded-2xl overflow-hidden shadow-sm">
                        <HeroBannerSlider />
                    </div>

                    {categoryCards.length > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-2 px-0.5">
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                                    {t('Kategoriyalar', 'Категории')}
                                </h2>
                                <Link href="/catalog" className="text-xs text-blue-600 hover:underline font-medium">
                                    {t('Barchasi →', 'Все →')}
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                                {categoryCards.map(({ cat, rep, count }) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white"
                                    >
                                        <div className="h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {rep.image && rep.image !== '/placeholder.png' ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={rep.image}
                                                    alt={rep.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <CategoryIcon name={cat.icon} className="w-10 h-10 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                                                {cat.name[language as keyof typeof cat.name] ?? cat.name.uz}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {count} {t('ta mahsulot', 'товаров')}
                                            </p>
                                        </div>
                                        {rep.isFeatured && (
                                            <div className="absolute top-1.5 right-1.5 bg-amber-400 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                                ⭐
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
