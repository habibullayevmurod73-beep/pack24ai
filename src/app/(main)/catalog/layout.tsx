import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Katalog — Qadoqlash Mahsulotlari',
    description:
        "Pack24 katalogi: karton qutlar, gofrokarton, stretch-plyonka, havo-pufakchali plyonka va boshqa qadoqlash materiallari. Eng arzon narxlar O'zbekistonda.",
    keywords: [
        'qadoqlash katalog',
        'karton quti sotib olish',
        'gofrokarton',
        'packaging Uzbekistan',
        'pack24 catalog',
    ],
    openGraph: {
        title: 'Katalog — Pack24 Qadoqlash Yechimlari',
        description:
            "Barcha qadoqlash mahsulotlari bir joyda. Karton qutlar, gofrokarton, stretch-plyonka — eng arzon narxlar O'zbekistonda.",
        url: 'https://pack24.uz/catalog',
    },
    alternates: { canonical: 'https://pack24.uz/catalog' },
};

// Catalog layout — sodda wrapper, sidebar page.tsx ichida boshqariladi
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </div>
    );
}
