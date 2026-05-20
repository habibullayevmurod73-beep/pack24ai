import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Chegirmalar va aksiyalar",
    description:
        "Pack24 chegirmalari: optom narxlar, mavsumiy aksiyalar, VIP mijozlar uchun maxsus takliflar. 500 000 so'mdan 3% gacha, 30 mln so'mdan 15%+VIP.",
    keywords: [
        'pack24 chegirma',
        'qadoqlash aksiya',
        "optom qadoqlash O'zbekiston",
        'pack24 discounts',
    ],
    openGraph: {
        title: 'Chegirmalar — Pack24',
        description:
            "Optom narxlar va maxsus takliflar. 500 000 so'mdan 3%, 30 mln so'mdan 15%+VIP.",
        url: 'https://pack24.uz/discounts',
    },
    alternates: { canonical: 'https://pack24.uz/discounts' },
};

export default function DiscountsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
