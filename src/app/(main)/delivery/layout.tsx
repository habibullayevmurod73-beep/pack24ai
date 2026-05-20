import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Yetkazib berish',
    description:
        "Pack24 yetkazib berish shartlari: Toshkent bo'yicha 1 kun, viloyatlarga 1–3 kun. O'z-o'ziga olib ketish BEPUL. 500 000 so'mdan ortiq buyurtmada Toshkent yetkazib berish BEPUL.",
    keywords: [
        'pack24 yetkazib berish',
        "Toshkent yetkazib berish bepul",
        'packaging delivery Uzbekistan',
        "qadoqlash yetkazib berish O'zbekiston",
    ],
    openGraph: {
        title: 'Yetkazib berish — Pack24',
        description:
            "Toshkent bo'yicha 1 kunda, viloyatlarga 1–3 kunda yetkazamiz. 500 000 so'mdan ortiq buyurtmada BEPUL yetkazib berish.",
        url: 'https://pack24.uz/delivery',
    },
    alternates: { canonical: 'https://pack24.uz/delivery' },
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
