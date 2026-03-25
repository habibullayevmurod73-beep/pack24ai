'use client';

import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function CTABanner() {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    return (
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
                    {isRu ? 'Готовы сделать заказ?' : 'Buyurtma berishga tayyormisiz?'}
                </h2>
                <p className="text-emerald-100 text-sm mb-6 max-w-xl mx-auto">
                    {isRu
                        ? 'Выбирайте из 1000+ товаров. Спеццены при оптовых заказах.'
                        : "1000+ mahsulot orasidan tanlang. Optom buyurtmalarda maxsus narxlar."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg"
                    >
                        {isRu ? 'Перейти в каталог' : "Katalogga o'tish"} <ArrowRight size={15} />
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
    );
}
