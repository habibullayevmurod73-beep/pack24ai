'use client';

import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import type { Language } from '@/lib/translations';

type L = Record<Language, string>;

const HEADING: L = {
    uz: 'Buyurtma berishga tayyormisiz?', ru: 'Готовы сделать заказ?', en: 'Ready to order?',
    qr: 'Buyırtpa berishe tayınmısız?', zh: '准备好下单了吗？', tr: 'Sipariş vermeye hazır mısınız?',
    tg: 'Барои фармоиш омодаед?', kk: 'Тапсырыс беруге дайынсыз ба?',
    tk: 'Sargyt bermäge taýynmy?', fa: 'آماده سفارش هستید؟',
};
const SUBTEXT: L = {
    uz: "1000+ mahsulot orasidan tanlang. Optom buyurtmalarda maxsus narxlar.",
    ru: 'Выбирайте из 1000+ товаров. Спеццены при оптовых заказах.',
    en: 'Choose from 1000+ products. Special prices for wholesale orders.',
    qr: "1000+ mahsulot arasınan tańlań. Optom buyırtpalarda arnaúlı bahalar.",
    zh: '从1000+产品中选择。批量订单享特价。',
    tr: '1000+ ürün arasından seçin. Toptan siparişlerde özel fiyatlar.',
    tg: 'Аз 1000+ маҳсулот интихоб кунед. Нархҳои махсус барои фармоишҳои яклухт.',
    kk: '1000+ өнімнен таңдаңыз. Көтерме тапсырыстарға арнайы бағалар.',
    tk: '1000+ önümden saýlaň. Lomaý sargytlar üçin ýörite bahalar.',
    fa: 'از ۱۰۰۰+ محصول انتخاب کنید. قیمت‌های ویژه برای سفارش‌های عمده.',
};
const BTN_CATALOG: L = {
    uz: "Katalogga o'tish", ru: 'Перейти в каталог', en: 'Go to Catalog',
    qr: 'Katalogqa ótiwi', zh: '去目录', tr: 'Kataloğa Git',
    tg: 'Рафтан ба каталог', kk: 'Каталогқа өту', tk: 'Kataloga git', fa: 'رفتن به کاتالوگ',
};

export default function CTABanner() {
    const { language } = useLanguage();

    return (
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
                    {HEADING[language] ?? HEADING.uz}
                </h2>
                <p className="text-emerald-100 text-sm mb-6 max-w-xl mx-auto">
                    {SUBTEXT[language] ?? SUBTEXT.uz}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg"
                    >
                        {BTN_CATALOG[language] ?? BTN_CATALOG.uz} <ArrowRight size={15} />
                    </Link>
                    <a
                        href="tel:+998880557888"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                    >
                        <Phone size={15} /> +998 88 055-78-88
                    </a>
                </div>
            </div>
        </section>
    );
}
