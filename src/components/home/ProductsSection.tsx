'use client';

import Link from 'next/link';
import { Package, ChevronRight, ArrowRight } from 'lucide-react';
import { useProductStore } from '@/lib/store/useProductStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { toast } from 'sonner';
import { ProductCard } from '@/components/home/ProductCard';
import type { Product } from '@/lib/store/useProductStore';

function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function ProductsSection() {
    const { language } = useLanguage();
    const { products, loading } = useProductStore();
    const { addToCart } = useCartStore();

    const t = (uz: string, ru: string) => language === 'uz' ? uz : ru;

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: Number(product.id),
            name:      product.name,
            price:     product.price,
            image:     product.image,
            quantity:  1,
        });
        toast.success(t("Savatga qo'shildi! 🎉", 'Добавлено в корзину! 🎉'));
    };

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {t('Mashhur Mahsulotlar', 'Популярные товары')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("Eng ko'p sotilayotgan qadoqlash materiallari", 'Самые продаваемые упаковочные материалы')}
                    </p>
                </div>
                <Link
                    href="/catalog"
                    className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                    {t("Barchasini ko'rish", 'Смотреть все')} <ChevronRight size={16} />
                </Link>
            </div>

            {loading ? (
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
                    <p className="text-sm">{t('Mahsulotlar topilmadi', 'Товары не найдены')}</p>
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
                            {t("Barchasini ko'rish", 'Смотреть все')} <ArrowRight size={15} />
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}
