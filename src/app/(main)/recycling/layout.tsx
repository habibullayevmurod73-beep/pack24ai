import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Qayta ishlash — Eco Recycling',
    description:
        "Pack24 eco-recycling dasturi: qadoqlash materiallarini qayta ishlang, ball to'plang, chegirmalar oling. Yashil kelajak uchun birga ishlaymiz.",
    keywords: [
        'pack24 recycling',
        "qadoqlash qayta ishlash O'zbekiston",
        'eco packaging Uzbekistan',
        'qayta ishlash dasturi',
    ],
    openGraph: {
        title: 'Eco Recycling — Pack24',
        description:
            "Qadoqlash materiallarini qayta ishlang, ball to'plang, chegirmalar oling.",
        url: 'https://pack24.uz/recycling',
    },
    alternates: { canonical: 'https://pack24.uz/recycling' },
};

export default function RecyclingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
