import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pack24.uz';

export default async function sitemap() {
    // Static pages
    const staticPages = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
        { url: `${BASE_URL}/catalog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
        { url: `${BASE_URL}/tools/ai-design`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
        { url: `${BASE_URL}/tools/dieline`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
        { url: `${BASE_URL}/tools/mockup-generator`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
        { url: `${BASE_URL}/cart`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
        { url: `${BASE_URL}/checkout`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    ];

    // Dynamic: categories
    let categoryPages: typeof staticPages = [];
    let productPages: typeof staticPages = [];

    try {
        const categories = await prisma.category.findMany({
            select: { slug: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
        });
        categoryPages = categories.map((cat: { slug: string; updatedAt: Date | null }) => ({
            url: `${BASE_URL}/catalog/${cat.slug}`,
            lastModified: cat.updatedAt ?? new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        const products = await prisma.product.findMany({
            where: { status: 'active' },
            select: { id: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1000, // max 1000 products in sitemap
        });
        productPages = products.map((p: { id: number; updatedAt: Date | null }) => ({
            url: `${BASE_URL}/product/${p.id}`,
            lastModified: p.updatedAt ?? new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error('[Sitemap]', e);
    }

    return [...staticPages, ...categoryPages, ...productPages];
}
