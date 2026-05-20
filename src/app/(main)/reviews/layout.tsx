import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sharhlar va fikrlar',
    description:
        "Pack24 mijozlarining sharhlari: sifat, yetkazib berish, narxlar haqida haqiqiy fikrlar. 4.8★ o'rtacha baho, 500+ sharh.",
    keywords: [
        'pack24 sharhlar',
        'pack24 reviews',
        "qadoqlash sharhlar O'zbekiston",
        'packaging reviews',
    ],
    openGraph: {
        title: 'Sharhlar — Pack24',
        description: "Haqiqiy mijozlar sharhlari. 4.8★ o'rtacha baho, 500+ sharh.",
        url: 'https://pack24.uz/reviews',
    },
    alternates: { canonical: 'https://pack24.uz/reviews' },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
