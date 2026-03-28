'use client';

import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCartStore } from '@/lib/store/useCartStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { translateProductName } from '@/lib/product-translations';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, Package, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
    const { language } = useLanguage();
    const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
    const { addToCart } = useCartStore();
    const hasMounted = useHasMounted();

    const t = (uz: string, ru: string, en?: string) =>
        language === 'uz' ? uz : language === 'en' ? (en ?? ru) : ru;

    if (!hasMounted) return null;

    const handleAddToCart = (item: typeof items[0]) => {
        addToCart({
            productId: Number(item.productId),
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
        });
        toast.success(t("Savatga qo'shildi", "Добавлено в корзину"));
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Heart size={24} className="text-red-500 fill-red-500" />
                    <h1 className="text-2xl font-black text-gray-900">
                        {t("Sevimlilar", "Избранное", "Wishlist")}
                    </h1>
                    {items.length > 0 && (
                        <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {items.length > 0 && (
                        <button
                            onClick={() => { clearWishlist(); toast(t("Sevimlilar tozalandi", "Избранное очищено")); }}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                            {t("Barchasini o'chirish", "Очистить всё")}
                        </button>
                    )}
                    <Link
                        href="/catalog"
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                        <ArrowLeft size={14} />
                        {t("Katalogga qaytish", "Вернуться в каталог")}
                    </Link>
                </div>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
                    <Heart size={56} className="mx-auto text-gray-200 mb-4" />
                    <h2 className="text-lg font-bold text-gray-700 mb-2">
                        {t("Sevimlilar bo'sh", "Избранное пусто", "Wishlist is empty")}
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        {t(
                            "Yoqtirgan mahsulotlaringizni yurak belgisini bosib saqlang",
                            "Нажмите на сердечко у товара, чтобы добавить его сюда",
                            "Click the heart icon on any product to save it here"
                        )}
                    </p>
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        <ShoppingCart size={16} />
                        {t("Katalogga o'tish", "Перейти в каталог")}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item) => {
                        const translatedName = translateProductName(item.name, language);
                        return (
                            <div
                                key={item.productId}
                                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col group"
                            >
                                {/* Image */}
                                <div className="relative h-44 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
                                    <Link href={`/product/${item.productId}`}>
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={translatedName}
                                                fill
                                                className="object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width:640px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={40} className="text-gray-300" />
                                            </div>
                                        )}
                                    </Link>
                                    {/* Remove button */}
                                    <button
                                        onClick={() => {
                                            removeFromWishlist(item.productId);
                                            toast(t("Sevimlilardan olib tashlandi", "Удалено из избранного"));
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        title={t("O'chirish", "Удалить")}
                                    >
                                        <Heart size={13} fill="currentColor" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-3 flex flex-col flex-1">
                                    <Link href={`/product/${item.productId}`}>
                                        <h3 className="text-xs font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                                            {translatedName}
                                        </h3>
                                    </Link>
                                    <div className="mt-auto">
                                        <p className="font-black text-gray-900 text-base mb-2">
                                            {item.price.toLocaleString()}{' '}
                                            <span className="text-xs text-gray-400 font-normal">
                                                {language === 'uz' ? "so'm" : language === 'en' ? 'UZS' : 'сум'}
                                            </span>
                                        </p>
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors active:scale-95"
                                        >
                                            <ShoppingCart size={12} />
                                            {t("Savatga qo'shish", "В корзину", "Add to cart")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
