import type { Metadata } from 'next';
import { FAQPageLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: "Ko'p beriladigan savollar (FAQ)",
    description:
        "Pack24 haqida ko'p beriladigan savollar: buyurtma berish, yetkazib berish, optom narxlar, quti o'lchamlari va boshqalar. Tezkor javoblar bir joyda.",
    keywords: [
        'pack24 savollar',
        'pack24 FAQ',
        "qadoqlash savollar O'zbekiston",
        'packaging FAQ Uzbekistan',
    ],
    openGraph: {
        title: "Ko'p beriladigan savollar — Pack24",
        description:
            "Buyurtma, yetkazib berish, optom narxlar haqida savollar va javoblar.",
        url: 'https://pack24.uz/faq',
    },
    alternates: { canonical: 'https://pack24.uz/faq' },
};

// Top FAQ questions for Google FAQ Rich Results
const TOP_FAQ = [
    {
        question: "Pack24 yetkazib berish muddati qancha?",
        answer: "Toshkent bo'yicha 1 kun, viloyatlarga 1–3 kun. O'z-o'ziga olib ketish bepul, har kuni 08:00–21:00.",
    },
    {
        question: "Optom narxlar qachondan boshlanadi?",
        answer: "500 000 so'mdan 3% chegirma, 2 mln so'mdan 5%, 5 mln so'mdan 7%, 15 mln so'mdan 10%, 30 mln so'mdan 15%+VIP.",
    },
    {
        question: "Buyurtmaga quti ishlab chiqarasizmi?",
        answer: "Afsuski, individual o'lchamdagi qutilami ishlab chiqarmaymiz. Faqat saytdagi tayyor assortiment sotiladi.",
    },
    {
        question: "Toshkentda yetkazib berish bepulmi?",
        answer: "500 000 so'mdan ortiq buyurtmada Toshkent bo'yicha yetkazib berish BEPUL. Kuryer orqali 1 mln so'mdan BEPUL.",
    },
    {
        question: "Qutining tashqi o'lchamini qanday aniqlash mumkin?",
        answer: "Saytda ichki o'lchamlar ko'rsatilgan, gofrokarton qalinligi taxminan 3 mm. Tashqi o'lcham = ichki o'lcham + 3 mm (har tomondan).",
    },
];

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <FAQPageLd questions={TOP_FAQ} />
            {children}
        </>
    );
}
