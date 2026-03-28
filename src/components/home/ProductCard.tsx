'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/store/useProductStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translateProductName, translateCategory, getProductUI } from '@/lib/product-translations';

interface ProductCardProps {
    product: Product;
    onAdd: (p: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
    const { language } = useLanguage();

    const isHit =
        (product.rating ?? 0) >= 4.5 ||
        (product.originalPrice != null && product.originalPrice > product.price);

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : null;

    const translatedName = translateProductName(product.name, language);
    const translatedCategory = product.category
        ? translateCategory(product.category, language)
        : '';

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={translatedName}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <Package size={48} className="text-gray-300" />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isHit && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {getProductUI('hit', language)}
                        </span>
                    )}
                    {discount && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{discount}%
                        </span>
                    )}
                </div>

                <button
                    aria-label="Sevimlilarga qo'shish"
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Heart size={14} />
                </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
                {/* Category */}
                {translatedCategory && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">
                        {translatedCategory}
                    </span>
                )}

                {/* Product name */}
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-3">
                        {translatedName}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">
                            {getProductUI('price', language)}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                            <p className="font-bold text-gray-900 text-base">
                                {product.price?.toLocaleString()}{' '}
                                <span className="text-xs font-normal text-gray-500">
                                    {getProductUI('currency', language)}
                                </span>
                            </p>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-[11px] text-gray-400 line-through">
                                    {product.originalPrice.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => onAdd(product)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors active:scale-95"
                    >
                        <ShoppingCart size={13} />
                        <span>{getProductUI('addToCart', language)}</span>
                    </button>
                </div>

                {/* Stock status */}
                <p className={`text-[10px] mt-2 font-medium ${product.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                    {product.inStock
                        ? `✓ ${getProductUI('inStock', language)}`
                        : `✗ ${getProductUI('outOfStock', language)}`}
                </p>
            </div>
        </div>
    );
}
