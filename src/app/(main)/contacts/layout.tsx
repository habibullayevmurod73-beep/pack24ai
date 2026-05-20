import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kontaktlar',
    description:
        "Pack24 bilan bog'laning: manzil, telefon, email. Toshkent shahrida joylashgan ombor. Savollaringiz uchun operatorlar 08:00–22:00 xizmatda.",
    keywords: [
        'pack24 kontakt',
        'pack24 telefon',
        "qadoqlash do'koni Toshkent",
        'packaging contact Uzbekistan',
    ],
    openGraph: {
        title: "Kontaktlar — Pack24 bilan bog'laning",
        description:
            'Manzil, telefon, email va ijtimoiy tarmoqlar. Operatorlar har kuni 08:00–22:00 xizmatda.',
        url: 'https://pack24.uz/contacts',
    },
    alternates: { canonical: 'https://pack24.uz/contacts' },
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
