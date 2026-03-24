'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProductStore } from '@/lib/store/useProductStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCurrencySafe } from '@/lib/contexts/CurrencyContext';
import { useCartStore } from '@/lib/store/useCartStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
    ChevronRight, Package, SlidersHorizontal, Box,
    ShoppingCart, Star, Grid3x3, LayoutList, X
} from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const { language } = useLanguage();
    const { format } = useCurrencySafe();
    const { addToCart } = useCartStore();
    const categories = useCategoryStore(s => s.categories);
    const products = useProductStore(s => s.products);
    const fetchProducts = useProductStore(s => s.fetchProducts);
    const hasMounted = useProductStore(s => !s.loading);

    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc' | 'rating'>('default');
    const [showFilters, setShowFilters] = useState(false);

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    useEffect(() => {
        // Har doim active mahsulotlarni yuklaymiz
        fetchProducts({ status: 'active' });
    }, []);

    // Kategoriyani topish (slug yoki name bilan)
    const category = categories.find(c =>
        c.slug === slug ||
        (c.name && typeof c.name === 'object' && Object.values(c.name as object).some(v =>
            typeof v === 'string' && v.toLowerCase().replace(/\s+/g, '-') === slug
        )) ||
        (typeof c.name === 'string' && (c.name as string).toLowerCase().replace(/\s+/g, '-') === slug)
    );

    // Kategoriya nomi
    const catName = category
        ? (typeof category.name === 'object'
            ? ((category.name as Record<string, string>)[language] ?? (category.name as Record<string, string>)['ru'] ?? slug)
            : String(category.name))
        : slug.replace(/-/g, ' ');

    // Apostrof va maxsus belgilarni normalizatsiya qilish
    const norm = (s: string) =>
        s.toLowerCase().trim().replace(/[''`'ʻʼ]/g, '').trim();

    // Mahsulotlarni filtrlash — 3 ta aniq holat
    const filtered = products.filter(p => {
        if (p.status !== 'active') return false;
        if (!p.category) return false;
        const pCat = p.category.toLowerCase().trim();
        const slugLower = slug.toLowerCase();

        // 1. To'g'ridan slug moslik (yangi mahsulotlar: "tort-klapanli" === "tort-klapanli")
        if (pCat === slugLower) return true;

        // 2. Nom → slug (apostrof tozalab, bo'shliq → defis): "To'rt klapanli" → "tort-klapanli"
        const pCatAsSlug = norm(pCat).replace(/\s+/g, '-');
        if (pCatAsSlug === slugLower) return true;

        // 3. Nom so'zlari moslik: "tort klapanli" === "tort klapanli"
        const slugAsWords = slugLower.replace(/-/g, ' ');
        const pCatNorm = norm(pCat);
        if (pCatNorm === slugAsWords) return true;

        return false;
    });

    // Tartiblash
    const sorted = [...filtered].sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price;
        if (sort === 'price_desc') return b.price - a.price;
        if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
    });

    const handleAdd = (product: any) => {
        addToCart({ productId: Number(product.id), name: product.name, price: product.price, image: product.image, quantity: 1 });
        toast.success(t("Savatga qo'shildi! 🎉", "Добавлено в корзину! 🎉"));
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            {/* Header strip */}
            <div className="bg-white border-b border-gray-100 py-5">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Link href="/" className="hover:text-blue-600">{t("Bosh sahifa", "Главная")}</Link>
                        <ChevronRight size={12} />
                        <Link href="/catalog" className="hover:text-blue-600">{t("Katalog", "Каталог")}</Link>
                        <ChevronRight size={12} />
                        <span className="text-gray-800 font-medium capitalize">{catName}</span>
                    </nav>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 capitalize">{catName}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{sorted.length} {t("ta mahsulot", "товаров")}</p>
                        </div>

                        {/* Sort + View */}
                        <div className="flex items-center gap-3">
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value as typeof sort)}
                                title={t("Tartiblash", "Сортировка")}
                                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-blue-400"
                            >
                                <option value="default">{t("Standart", "По умолчанию")}</option>
                                <option value="price_asc">{t("Narx: arzondan", "Цена: по возрастанию")}</option>
                                <option value="price_desc">{t("Narx: qimmatdan", "Цена: по убыванию")}</option>
                                <option value="rating">{t("Reytingga ko'ra", "По рейтингу")}</option>
                            </select>

                            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setView('grid')}
                                    aria-label="Grid ko'rinish"
                                    className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Grid3x3 size={14} />
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    aria-label="List ko'rinish"
                                    className={`p-2.5 transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <LayoutList size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading */}
                {!hasMounted && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                <Skeleton className="h-48 rounded-none" />
                                <div className="p-4 space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /><div className="flex justify-between pt-1"><Skeleton className="h-5 w-20" /><Skeleton className="h-8 w-20 rounded-xl" /></div></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No products */}
                {hasMounted && sorted.length === 0 && (
                    <div className="text-center py-24">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">{t("Bu kategoriyada mahsulot topilmadi.", "В этой категории нет товаров.")}</p>
                        <Link href="/catalog" className="text-blue-600 hover:underline text-sm font-semibold mt-3 inline-block">
                            ← {t("Barcha kategoriyalar", "Все категории")}
                        </Link>
                    </div>
                )}

                {/* Products grid */}
                {hasMounted && sorted.length > 0 && (
                    <div className={view === 'grid'
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                        : "flex flex-col gap-3"
                    }>
                        {sorted.map(product => {
                            const isOnSale = product.originalPrice && product.originalPrice > product.price;
                            const discount = isOnSale ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;

                            if (view === 'list') {
                                return (
                                    <div key={product.id} className="bg-white rounded-2xl border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow">
                                        <Link href={`/product/${product.id}`} className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-contain" /> : <Box size={32} className="text-gray-200" />}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/product/${product.id}`}>
                                                <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="text-xs text-gray-500">{product.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end justify-between shrink-0">
                                            <div className="text-right">
                                                <p className="font-extrabold text-gray-900 text-lg">{format(product.price)}</p>
                                                {isOnSale && <p className="text-xs text-gray-400 line-through">{format(product.originalPrice!)}</p>}
                                            </div>
                                            <button onClick={() => handleAdd(product)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                                                <ShoppingCart size={12} />{t("Qo'shish", "В корзину")}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                    <Link href={`/product/${product.id}`} className="relative block h-44 bg-gradient-to-br from-gray-50 to-gray-100">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Box size={40} className="text-gray-200" /></div>
                                        )}
                                        {isOnSale && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">-{discount}%</span>}
                                    </Link>
                                    <div className="p-3">
                                        <p className="text-[10px] text-gray-400 mb-0.5">{product.category}</p>
                                        <Link href={`/product/${product.id}`}>
                                            <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                                        </Link>
                                        {product.rating > 0 && (
                                            <div className="flex items-center gap-0.5 mb-2">
                                                {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-sm">{format(product.price)}</p>
                                                {isOnSale && <p className="text-[10px] text-gray-400 line-through">{format(product.originalPrice!)}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleAdd(product)}
                                                aria-label={t("Savatga qo'shish", "В корзину")}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                            >
                                                <ShoppingCart size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
