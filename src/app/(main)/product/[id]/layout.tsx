import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pack24.uz';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            select: {
                name: true,
                description: true,
                price: true,
                image: true,
                category: true,
            },
        });

        if (!product) {
            return {
                title: 'Mahsulot topilmadi',
                description: 'Kechirasiz, bu mahsulot mavjud emas.',
            };
        }

        const title = product.name;
        const description = product.description
            ? product.description.slice(0, 160)
            : `${product.name} — Pack24 da ${product.price.toLocaleString()} so'mdan. Tez yetkazib berish, sifat kafolati.`;

        return {
            title,
            description,
            keywords: [
                product.name,
                product.category ?? 'qadoqlash',
                'pack24',
                'quti',
                "O'zbekiston",
                'packaging',
            ],
            openGraph: {
                title: `${title} | Pack24`,
                description,
                url: `${BASE_URL}/product/${id}`,
                siteName: 'Pack24',
                type: 'article',
                images: product.image
                    ? [{ url: product.image, width: 800, height: 600, alt: title }]
                    : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${title} | Pack24`,
                description,
                images: product.image ? [product.image] : [],
            },
            alternates: {
                canonical: `${BASE_URL}/product/${id}`,
            },
        };
    } catch {
        return {
            title: 'Mahsulot | Pack24',
            description: 'Pack24 — qadoqlash yechimlari',
        };
    }
}

// Default layout — App Router da layout.tsx children render qiladi
export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
