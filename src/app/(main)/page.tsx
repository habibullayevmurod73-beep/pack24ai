'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useProductStore } from '@/lib/store/useProductStore';
import type { Product } from '@/lib/store/useProductStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { toast } from 'sonner';
import {
    ChevronRight, Star,
    Package, ArrowRight, Users,
    ShoppingCart, Heart, Phone, Mail, Quote
} from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import HeroBannerSlider from '@/components/HeroBannerSlider';
import CatalogSidebar from '@/components/CatalogSidebar';
import { useEffect, useRef, useState } from 'react';



// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1800, startOnView = true) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        if (!startOnView) { animateTo(); return; }
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !started.current) { started.current = true; animateTo(); } },
            { threshold: 0.4 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();

        function animateTo() {
            let start: number | null = null;
            const step = (ts: number) => {
                if (!start) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.floor(eased * target));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }
    }, [target, duration, startOnView]);

    return { value, ref };
}

// ─── Stat card (uses hook at top level) ──────────────────────────────────────
function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
    const { value, ref } = useAnimatedCounter(target);
    return (
        <div ref={ref}>
            <p className="text-4xl lg:text-5xl font-black text-white mb-2">
                {value.toLocaleString()}{suffix}
            </p>
            <p className="text-emerald-200 text-sm font-medium">{label}</p>
        </div>
    );
}

// ─── Reviews data ─────────────────────────────────────────────────────────────
const REVIEWS = [
    {
        name: { uz: 'Aziz Toshmatov', ru: 'Азиз Тошматов' },
        role: { uz: 'Savdo kompaniyasi', ru: 'Торговая компания' },
        text: {
            uz: "Pack24 dan 3 yildan beri xarid qilamiz. Sifat va tezkorlik ajoyib! Har safar kutilgan muddat oldidan yetkazib berishadi.",
            ru: "Покупаем у Pack24 уже 3 года. Качество и скорость — отличные! Всегда доставляют раньше срока.",
        },
        rating: 5, avatar: 'A', color: 'bg-blue-500',
    },
    {
        name: { uz: 'Malika Yusupova', ru: 'Малика Юсупова' },
        role: { uz: 'Restoran egasi', ru: 'Владелица ресторана' },
        text: {
            uz: "Oshxonamiz uchun qadoq materiallarini shu yerdan olamiz. Narxlar bozordan 20% arzon, sifat esa yuqori!",
            ru: "Берём упаковочные материалы для ресторана здесь. Цены на 20% ниже рынка, качество отличное!",
        },
        rating: 5, avatar: 'M', color: 'bg-emerald-500',
    },
    {
        name: { uz: 'Jasur Rahimov', ru: 'Жасур Рахимов' },
        role: { uz: 'Online do\'kon', ru: 'Интернет-магазин' },
        text: {
            uz: "Bulk import funksiyasi hayotimni osonlashtirdi. 500 ta mahsulotni bir vaqtda yuklab oldim. Juda qulay platforma!",
            ru: "Функция массового импорта облегчила жизнь. Загрузил 500 товаров за раз. Очень удобная платформа!",
        },
        rating: 5, avatar: 'J', color: 'bg-purple-500',
    },
    {
        name: { uz: 'Dilnoza Karimova', ru: 'Дильноза Каримова' },
        role: { uz: 'Konditeriya', ru: 'Кондитерская' },
        text: {
            uz: "Tort qutilari va bantlar juda chiroyli. Mijozlarimiz doim mamnun. Buyurtma berish ham juda oson!",
            ru: "Коробки для тортов и банты очень красивые. Клиенты всегда довольны. Заказывать очень легко!",
        },
        rating: 5, avatar: 'D', color: 'bg-pink-500',
    },
    {
        name: { uz: 'Bobur Ismoilov', ru: 'Бобур Исмоилов' },
        role: { uz: 'Logistika kompaniyasi', ru: 'Логистическая компания' },
        text: {
            uz: "Stretch plyonkalar va lentalar yaxshi. Optom narxlarda 15% chegirma olmoqdamiz. Hamkorlik davom etadi!",
            ru: "Стрейч-плёнки и ленты хорошие. Получаем 15% скидку по оптовым ценам. Сотрудничество продолжается!",
        },
        rating: 4, avatar: 'B', color: 'bg-orange-500',
    },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
    const isHit = (product.rating ?? 0) >= 4.5 || (product.originalPrice != null && product.originalPrice > product.price);
    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <Package size={48} className="text-gray-300" />
                )}
                {isHit && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Hit
                    </span>
                )}
                <button aria-label="Sevimlilarga qo'shish" className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Heart size={14} />
                </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">{product.category}</span>
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-3">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Narx</p>
                        <p className="font-bold text-gray-900 text-base">
                            {product.price?.toLocaleString()} <span className="text-xs font-normal text-gray-500">so'm</span>
                        </p>
                    </div>
                    <button
                        onClick={() => onAdd(product)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors active:scale-95"
                    >
                        <ShoppingCart size={13} />
                        <span>Qo'sh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Category card types ──────────────────────────────────────────────────────
interface CategoryCardProps {
    category: {
        id: string;
        slug: string;
        icon: string;
        name: { uz: string; ru: string; en: string };
        productCount: number;
        isActive: boolean;
    };
    language: string;
}

// ─── Category card ────────────────────────────────────────────────────────────
function CategoryCard({ category, language }: CategoryCardProps) {
    const GRADIENTS = [
        'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
        'from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200',
        'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
        'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
        'from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200',
        'from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200',
        'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200',
        'from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200',
    ];
    // Use slug char sum for deterministic gradient — avoids id type dependency
    const slugSum = category.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const gradient = GRADIENTS[slugSum % GRADIENTS.length];
    const catName = category.name[language as keyof typeof category.name] || category.name.ru;

    return (
        <Link
            href={`/category/${category.slug}`}
            className={`group flex flex-col items-center justify-center p-5 bg-gradient-to-br ${gradient} rounded-2xl border border-white/60 hover:shadow-md transition-all duration-200 text-center h-[140px]`}
        >
            <div className="w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <CategoryIcon name={category.icon} className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">
                {catName}
            </h3>
            {category.productCount > 0 && (
                <span className="text-[10px] text-gray-500 mt-1">{category.productCount} ta</span>
            )}
        </Link>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
    const { language } = useLanguage();
    const categories = useCategoryStore((state) => state.categories);
    const { products, fetchProducts, loading: productsLoading } = useProductStore();
    const { addToCart } = useCartStore();
    const hasMounted = useHasMounted();

    const t = (uz: string, ru: string, en?: string): string =>
        language === 'uz' ? uz : language === 'en' ? (en ?? ru) : ru;

    // DB dan mahsulotlarni yuklash (barcha active mahsulotlar)
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = (product: Product) => {
        addToCart({ productId: Number(product.id), name: product.name, price: product.price, image: product.image, quantity: 1 });
        toast.success(t("Savatga qo'shildi! 🎉", 'Добавлено в корзину! 🎉'));
    };

    if (!hasMounted) return null;

    const activeCategories = categories.filter((c) => c.isActive);

    return (
        <div className="min-h-screen bg-[#f5f6fa]">

            {/* ── TOP BLOCK: Sidebar + Slider + Promos ────────── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
                <div className="flex gap-5 items-start">

                    {/* Left: Catalog Sidebar - hidden on small screens */}
                    <div className="hidden lg:block shrink-0">
                        <CatalogSidebar />
                    </div>

                    {/* Right: Banner slider + promo cards */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">

                        {/* Hero Slider */}
                        <div className="rounded-2xl overflow-hidden shadow-sm">
                            <HeroBannerSlider />
                        </div>

                        {/* Promo Banners 2-col */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/catalog?filter=new" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
                                <div className="relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200">{t("Yangilik", "Новинки")}</span>
                                    <h3 className="text-xl font-extrabold mt-1.5 mb-2">{t("2026 yangi kolleksiya", "Новая коллекция 2026")}</h3>
                                    <p className="text-blue-100 text-xs mb-4">{t("Eng zamonaviy dizayndagi qadoqlar", "Самые современные дизайнерские упаковки")}</p>
                                    <span className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                                        {t("Ko'rish", "Смотреть")} <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>

                            <Link href="/special-offers" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                                <div className="relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">{t("Maxsus taklif", "Спецпредложение")}</span>
                                    <h3 className="text-xl font-extrabold mt-1.5 mb-1">{t("Optom buyurtma", "Оптовый заказ")}</h3>
                                    <div className="text-4xl font-black my-2 text-white">-15%</div>
                                    <p className="text-emerald-100 text-xs mb-4">{t("100 ta va undan ko'p buyurtma uchun", "При заказе от 100 единиц")}</p>
                                    <span className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                                        {t("Batafsil", "Подробнее")} <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE CATEGORY STRIP (lg:hidden) ─────────────── */}
            <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                    <div className="flex gap-2 px-4 py-3 w-max">
                        {/* "All" button */}
                        <Link
                            href="/catalog"
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div className="w-12 h-12 bg-[#0c2340] rounded-xl flex items-center justify-center shadow-sm">
                                <ChevronRight size={18} className="text-white" />
                            </div>
                            <span className="text-[10px] font-semibold text-[#0c2340] text-center whitespace-nowrap">
                                {t("Barchasi", "Все")}
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
                                    {cat.name[language as keyof typeof cat.name] ?? cat.name.uz}
                                </span>
                            </Link>
                        ))}

                        {/* More link */}
                        <Link
                            href="/catalog"
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center border border-gray-200 transition-colors">
                                <Package size={18} className="text-gray-500" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 text-center whitespace-nowrap">
                                {t("Ko'proq", "Ещё")}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>


            {/* ── FEATURE CARDS (pack24.ru uslubida) ──────────────── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { icon: '🚚', uz: "Tez yetkazish", ru: "Быстрая доставка", sub: { uz: "O'z kuni", ru: "В день заказа" }, color: 'bg-blue-50 border-blue-100' },
                            { icon: '💳', uz: "Xavfsiz to'lov", ru: "Безопасная оплата", sub: { uz: "Onlayn / naqd", ru: "Онлайн / наличные" }, color: 'bg-emerald-50 border-emerald-100' },
                            { icon: '🏆', uz: "Sifat kafolati", ru: "Гарантия качества", sub: { uz: "Sertifikatlangan", ru: "Сертифицировано" }, color: 'bg-yellow-50 border-yellow-100' },
                            { icon: '📦', uz: "Katta assortiment", ru: "Большой ассортимент", sub: { uz: "40+ kategoriya", ru: "40+ категорий" }, color: 'bg-purple-50 border-purple-100' },
                            { icon: '💰', uz: "Optom narxlar", ru: "Оптовые цены", sub: { uz: "100+ dona uchun", ru: "От 100 штук" }, color: 'bg-orange-50 border-orange-100' },
                            { icon: '🎨', uz: "Brending", ru: "Брендирование", sub: { uz: "Logotip bilan", ru: "С логотипом" }, color: 'bg-pink-50 border-pink-100' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.color} hover:shadow-sm transition-shadow cursor-default`}>
                                <span className="text-2xl shrink-0">{item.icon}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-tight truncate">{language === 'ru' ? item.ru : item.uz}</p>
                                    <p className="text-[10px] text-gray-500 leading-tight">{language === 'ru' ? item.sub.ru : item.sub.uz}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 3D KONFIGURATOR + B2B BIRLASHTIRILGAN ─────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-gradient-to-br from-[#0c2340] via-[#0f3460] to-[#16213e] rounded-3xl overflow-hidden relative">
                    {/* Blobs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)] pointer-events-none" />

                    <div className="relative z-10 p-6 lg:p-10">
                        <div className="flex flex-col xl:flex-row gap-10">

                            {/* LEFT: B2B + Configurator Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold text-blue-300">
                                        ✨ {t("3D Konfigurator", "3D Конфигуратор")}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                                        <Users size={11} /> {t("Korporativ hamkorlik", "Корпоративное сотрудничество")}
                                    </span>
                                </div>

                                <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3 leading-tight">
                                    {t("Qadoqingizni loyihalang va buyurtma bering", "Спроектируйте упаковку и сделайте заказ")}
                                </h2>
                                <p className="text-blue-200/80 text-sm mb-6 leading-relaxed">
                                    {t(
                                        "3D modelni tanlang, rang va hajmni sozlang. Optom buyurtmalarda maxsus narxlar, kredit va shaxsiy menejer mavjud.",
                                        "Выберите 3D-модель, настройте цвет и размер. Для оптовых заказов — спеццены, рассрочка и личный менеджер."
                                    )}
                                </p>

                                {/* Packaging Models Grid */}
                                <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">
                                    {t("Qadoq modellari", "Модели упаковки")}
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                                    {[
                                        {
                                            label: { uz: "Karton quti", ru: "Картонная коробка" },
                                            svg: (
                                                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                                    <rect x="10" y="22" width="40" height="30" rx="2" fill="rgba(96,165,250,0.3)" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
                                                    <path d="M10 22 L30 14 L50 22" stroke="rgba(147,197,253,0.9)" strokeWidth="1.5" fill="rgba(59,130,246,0.2)"/>
                                                    <path d="M30 14 L30 22" stroke="rgba(147,197,253,0.6)" strokeWidth="1" strokeDasharray="2 2"/>
                                                    <path d="M10 22 L10 52 M50 22 L50 52" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
                                                    <rect x="20" y="30" width="20" height="1.5" rx="1" fill="rgba(147,197,253,0.5)"/>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: { uz: "Kuryer paketi", ru: "Курьерский пакет" },
                                            svg: (
                                                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                                    <rect x="12" y="15" width="36" height="40" rx="3" fill="rgba(52,211,153,0.2)" stroke="rgba(110,231,183,0.8)" strokeWidth="1.5"/>
                                                    <path d="M12 24 L48 24" stroke="rgba(110,231,183,0.7)" strokeWidth="1.5"/>
                                                    <path d="M22 19.5 Q30 14 38 19.5" stroke="rgba(110,231,183,0.9)" strokeWidth="1.5" fill="none"/>
                                                    <rect x="23" y="29" width="14" height="8" rx="2" fill="none" stroke="rgba(110,231,183,0.6)" strokeWidth="1"/>
                                                    <path d="M26 33 H34" stroke="rgba(110,231,183,0.7)" strokeWidth="1"/>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: { uz: "BOPP paket", ru: "BOPP пакет" },
                                            svg: (
                                                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                                    <path d="M18 20 L18 52 Q18 55 30 55 Q42 55 42 52 L42 20 Q42 17 30 17 Q18 17 18 20 Z" fill="rgba(167,139,250,0.2)" stroke="rgba(196,181,253,0.8)" strokeWidth="1.5"/>
                                                    <ellipse cx="30" cy="20" rx="12" ry="4" fill="rgba(139,92,246,0.3)" stroke="rgba(196,181,253,0.7)" strokeWidth="1.2"/>
                                                    <path d="M22 12 L22 20 M38 12 L38 20" stroke="rgba(196,181,253,0.8)" strokeWidth="1.5"/>
                                                    <path d="M22 12 Q30 9 38 12" stroke="rgba(196,181,253,0.9)" strokeWidth="1.5" fill="none"/>
                                                    <path d="M24 35 H36" stroke="rgba(196,181,253,0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: { uz: "Yassi quti", ru: "Плоская коробка" },
                                            svg: (
                                                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                                    <rect x="8" y="26" width="44" height="18" rx="2" fill="rgba(251,191,36,0.2)" stroke="rgba(252,211,77,0.8)" strokeWidth="1.5"/>
                                                    <path d="M8 26 L18 18 L52 18 L52 26" fill="rgba(251,191,36,0.15)" stroke="rgba(252,211,77,0.7)" strokeWidth="1.2"/>
                                                    <path d="M52 18 L52 36" stroke="rgba(252,211,77,0.5)" strokeWidth="1.2"/>
                                                    <path d="M20 26 L20 44" stroke="rgba(252,211,77,0.4)" strokeWidth="1" strokeDasharray="2 2"/>
                                                    <path d="M14 32 H46" stroke="rgba(252,211,77,0.4)" strokeWidth="1"/>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: { uz: "Quvurli quti", ru: "Тубус" },
                                            svg: (
                                                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                                    <ellipse cx="30" cy="15" rx="12" ry="4" fill="rgba(251,113,133,0.3)" stroke="rgba(252,165,165,0.8)" strokeWidth="1.5"/>
                                                    <path d="M18 15 L18 48 Q18 52 30 52 Q42 52 42 48 L42 15" fill="rgba(251,113,133,0.15)" stroke="rgba(252,165,165,0.7)" strokeWidth="1.5"/>
                                                    <ellipse cx="30" cy="49" rx="12" ry="4" fill="rgba(239,68,68,0.2)" stroke="rgba(252,165,165,0.6)" strokeWidth="1.2"/>
                                                    <path d="M30 11 L30 15" stroke="rgba(252,165,165,0.7)" strokeWidth="1.5"/>
                                                    <circle cx="30" cy="10" r="2" fill="rgba(252,165,165,0.8)"/>
                                                </svg>
                                            )
                                        },
                                    ].map((model, i) => (
                                        <button key={i}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-105 ${i === 0 ? 'border-blue-400/60 bg-blue-500/15' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}
                                        >
                                            {model.svg}
                                            <span className="text-[10px] font-semibold text-blue-200/80 text-center leading-tight">
                                                {language === 'ru' ? model.label.ru : model.label.uz}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Color + CTA row */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex gap-2">
                                        {[
                                            { cls: 'bg-[#c8a97e]', label: 'Kraft' },
                                            { cls: 'bg-white',     label: t("Oq", "Белый") },
                                            { cls: 'bg-[#1e293b]', label: t("Qora", "Чёрный") },
                                            { cls: 'bg-blue-500',  label: t("Ko'k", "Синий") },
                                            { cls: 'bg-emerald-500', label: t("Yashil", "Зелёный") },
                                        ].map((c, i) => (
                                            <button key={i} title={c.label} aria-label={c.label}
                                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${c.cls} ${i === 0 ? 'border-white' : 'border-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Link href="/catalog?filter=custom" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 text-sm">
                                            🎨 {t("Buyurtma berish", "Заказать")}
                                        </Link>
                                        <a href="tel:+998712005683" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 text-sm">
                                            <Phone size={15} /> {t("Qo'ng'iroq", "Позвонить")}
                                        </a>
                                        <a href="mailto:b2b@pack24.uz" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                                            <Mail size={15} /> {t("Email", "Email")}
                                        </a>
                                    </div>
                                </div>
                                {/* ── DIZAYN ASBOBLARI ── */}
                                <div className="mt-6 pt-5 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                                            🎨 {t("Dizayn Asboblari", "Инструменты Дизайна")}
                                        </p>
                                        <Link href="/design-tools" className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                            {t("Barcha asboblar", "Все инструменты")} <ChevronRight size={10} />
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            {
                                                href: '/design-tools/mockup',
                                                icon: '🖼️',
                                                title: { uz: 'Mockup Generator', ru: 'Mockup Generator' },
                                                desc: { uz: "Mahsulotingizni haqiqiy ko'rinishda namoyish eting", ru: "Представьте продукт в реалистичном виде" },
                                                badge: { uz: 'Bepul', ru: 'Бесплатно' },
                                                badgeCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                                                borderCls: 'hover:border-emerald-400/40',
                                                iconBg: 'bg-emerald-500/15',
                                            },
                                            {
                                                href: '/design-tools/dieline',
                                                icon: '📐',
                                                title: { uz: 'Dieline Template', ru: 'Dieline Template' },
                                                desc: { uz: "Quti uchun professional kesish shablonlari", ru: "Профессиональные шаблоны развёрток" },
                                                badge: { uz: 'PDF', ru: 'PDF' },
                                                badgeCls: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                                borderCls: 'hover:border-blue-400/40',
                                                iconBg: 'bg-blue-500/15',
                                            },
                                            {
                                                href: '/design-tools/ai',
                                                icon: '🤖',
                                                title: { uz: 'AI Dizayn', ru: 'AI Дизайн' },
                                                desc: { uz: "Sun'iy intellekt yordamida avtomatik dizayn", ru: "Автоматический дизайн с ИИ" },
                                                badge: { uz: 'Yangi', ru: 'Новинка' },
                                                badgeCls: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                                                borderCls: 'hover:border-purple-400/40',
                                                iconBg: 'bg-purple-500/15',
                                            },
                                        ].map((tool, i) => (
                                            <Link key={i} href={tool.href}
                                                className={`group flex flex-col gap-2 p-3 rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 ${tool.borderCls}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className={`w-9 h-9 ${tool.iconBg} rounded-lg flex items-center justify-center text-lg`}>
                                                        {tool.icon}
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tool.badgeCls}`}>
                                                        {language === 'ru' ? tool.badge.ru : tool.badge.uz}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                                                        {language === 'ru' ? tool.title.ru : tool.title.uz}
                                                    </p>
                                                    <p className="text-[10px] text-blue-200/60 leading-tight mt-0.5">
                                                        {language === 'ru' ? tool.desc.ru : tool.desc.uz}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: 3D Box + Stats */}
                            <div className="shrink-0 flex flex-col items-center gap-6">
                                {/* 3D Rotating Box - full 6-face cube */}
                                <div className="relative flex items-center justify-center w-48 h-48">
                                    <div className="box-3d-wrapper flex items-center justify-center">
                                        <div className="box-3d">
                                            {/* Front */}
                                            <div className="box-face box-front">
                                                <span className="text-3xl opacity-90">📦</span>
                                                <span className="text-[10px] font-bold text-white/80 mt-1 tracking-widest">PACK24</span>
                                            </div>
                                            {/* Back */}
                                            <div className="box-face box-back" />
                                            {/* Left */}
                                            <div className="box-face box-left" />
                                            {/* Right */}
                                            <div className="box-face box-right" />
                                            {/* Top */}
                                            <div className="box-face box-top" />
                                            {/* Bottom */}
                                            <div className="box-face box-bottom" />
                                        </div>
                                    </div>
                                    {/* Glow shadow */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-blue-500/30 rounded-full blur-xl" />
                                </div>

                                {/* B2B Stats */}
                                <div className="grid grid-cols-2 gap-3 w-full max-w-[220px]">
                                    {[
                                        { num: '-15%', label: { uz: 'Ulgurji chegirma',    ru: 'Оптовая скидка' } },
                                        { num: '30',   label: { uz: 'Kun muddati',          ru: 'Дней рассрочки' } },
                                        { num: '24/7', label: { uz: 'Qo\'llab-quvvatlash', ru: 'Поддержка' } },
                                        { num: '1',    label: { uz: 'Shaxsiy menejer',      ru: 'Личный менеджер' } },
                                    ].map(({ num, label }, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center border border-white/10">
                                            <p className="text-xl font-black text-white">{num}</p>
                                            <p className="text-[10px] text-blue-200/70 font-medium leading-tight mt-0.5">{language === 'ru' ? label.ru : label.uz}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ── MAHSULOTLAR BO'LIMI ──────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            {t("Mashhur Mahsulotlar", "Популярные товары")}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("Eng ko'p sotilayotgan qadoqlash materiallari", "Самые продаваемые упаковочные материалы")}
                        </p>
                    </div>
                    <Link
                        href="/catalog"
                        className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                    >
                        {t("Barchasini ko'rish", "Смотреть все")} <ChevronRight size={16} />
                    </Link>
                </div>

                {productsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                <Skeleton className="h-48" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="flex justify-between items-center pt-2">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-8 w-16 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{t("Mahsulotlar topilmadi", "Товары не найдены")}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.slice(0, 10).map((product) => (
                                <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
                            ))}
                        </div>
                        <div className="mt-6 text-center sm:hidden">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                {t("Barchasini ko'rish", "Смотреть все")} <ArrowRight size={15} />
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {/* ── STATISTIKA BO'LIMI ────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#0c2340] to-[#1a4a7c] py-14">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
                            {t("Pack24 raqamlarda", "Pack24 в цифрах")}
                        </h2>
                        <p className="text-blue-200/70 text-sm">
                            {t("Bizning yutuqlarimiz sizning ishonchingiz", "Наши достижения — ваше доверие")}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <StatCard target={5000}  suffix="+"  label={t("Faol mijoz",        "Активных клиентов")} />
                        <StatCard target={40}    suffix="+"  label={t("Mahsulot kategoriyasi", "Категорий товаров")} />
                        <StatCard target={1500}  suffix="+"  label={t("Mahsulot turi",      "Видов продуктов")} />
                        <StatCard target={98}    suffix="%"  label={t("Mijoz qoniqishi",    "Удовлетворённость")} />
                    </div>
                </div>
            </section>

            {/* ── SHARHLAR BO'LIMI ─────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            {t("Mijozlar sharhlari", "Отзывы клиентов")}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("Haqiqiy mijozlarning fikrlari", "Мнения реальных покупателей")}
                        </p>
                    </div>
                    <Link
                        href="/reviews"
                        className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                    >
                        {t("Barcha sharhlar", "Все отзывы")} <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {REVIEWS.slice(0, 3).map((review, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-4">
                                {[1,2,3,4,5].map(s => (
                                    <Star
                                        key={s}
                                        size={16}
                                        className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                                    />
                                ))}
                            </div>

                            {/* Quote */}
                            <div className="relative flex-1">
                                <Quote size={32} className="text-blue-100 absolute -top-1 -left-1 pointer-events-none" />
                                <p className="text-sm text-gray-700 leading-relaxed relative z-10">
                                    {language === 'ru' ? review.text.ru : review.text.uz}
                                </p>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                                <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                    {review.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {language === 'ru' ? review.name.ru : review.name.uz}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {language === 'ru' ? review.role.ru : review.role.uz}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/reviews"
                        className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl text-sm transition-all duration-200"
                    >
                        {t("Barcha sharhlarni ko'rish", "Смотреть все отзывы")} <ArrowRight size={15} />
                    </Link>
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────── */}
            <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-12">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
                        {t("Buyurtma berishga tayyormisiz?", "Готовы сделать заказ?")}
                    </h2>
                    <p className="text-emerald-100 text-sm mb-6 max-w-xl mx-auto">
                        {t(
                            "1000+ mahsulot orasidan tanlang. Optom buyurtmalarda maxsus narxlar.",
                            "Выбирайте из 1000+ товаров. Спеццены при оптовых заказах."
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg"
                        >
                            {t("Katalogga o'tish", "Перейти в каталог")} <ArrowRight size={15} />
                        </Link>
                        <a
                            href="tel:+998712005683"
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                        >
                            <Phone size={15} /> +998 71 200 56 83
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}