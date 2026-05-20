import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/adminAuth';

// ─── POST /api/products/bulk-import — CSV/JSON orqali mahsulotlarni import qilish ───
export async function POST(req: NextRequest) {
    const authError = await verifyAdminAuth(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "products massivi bo'sh" }, { status: 400 });
        }

        if (products.length > 500) {
            return NextResponse.json({ error: 'Maksimal 500 ta mahsulot bolishi mumkin' }, { status: 400 });
        }

        const results = { created: 0, updated: 0, errors: [] as { row: number; error: string }[] };

        // Kategoriya va mavjud mahsulotlarni birdaniga olish (N+1 oldini olish)
        const allCategorySlugs = [...new Set(
            products.filter((r: Record<string, unknown>) => r.categorySlug).map((r: Record<string, unknown>) => String(r.categorySlug))
        )];
        const allSkus = [...new Set(
            products.filter((r: Record<string, unknown>) => r.sku).map((r: Record<string, unknown>) => String(r.sku))
        )];

        const [categories, existingProducts] = await Promise.all([
            allCategorySlugs.length > 0
                ? prisma.category.findMany({ where: { slug: { in: allCategorySlugs } }, select: { slug: true, name: true } })
                : [],
            allSkus.length > 0
                ? prisma.product.findMany({ where: { sku: { in: allSkus } }, select: { id: true, sku: true } })
                : [],
        ]);

        const categoryMap = new Map(categories.map(c => [c.slug, c.name]));
        const existingSkuMap = new Map(existingProducts.map(p => [p.sku, p.id]));

        for (let i = 0; i < products.length; i++) {
            const row = products[i];
            try {
                const { name, sku, price, originalPrice, categorySlug, description, image, status } = row;

                if (!name || !price) {
                    results.errors.push({ row: i + 1, error: 'name va price majburiy' });
                    continue;
                }

                // Kategoriya nomi lookup (Map dan)
                const categoryName = categorySlug ? categoryMap.get(String(categorySlug)) : undefined;

                // Upsert by SKU if provided, else create
                if (sku) {
                    const existingId = existingSkuMap.get(String(sku));
                    if (existingId) {
                        await prisma.product.update({
                            where: { id: existingId },
                            data: {
                                name:          String(name),
                                price:         Number(price),
                                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                                description:   description   ? String(description)   : undefined,
                                image:         image         ? String(image)         : undefined,
                                status:        status        ? (String(status) as ProductStatus) : undefined,
                                category:      categoryName,
                            },
                        });
                        results.updated++;
                        continue;
                    }
                }

                const created = await prisma.product.create({
                    data: {
                        name:          String(name),
                        sku:           sku           ? String(sku)           : undefined,
                        price:         Number(price),
                        originalPrice: originalPrice ? Number(originalPrice) : undefined,
                        description:   description   ? String(description)   : '',
                        image:         image         ? String(image)         : '/placeholder.png',
                        status:        status        ? (String(status) as ProductStatus) : ProductStatus.active,
                        category:      categoryName,
                    },
                });
                // Yangi yaratilganni Map ga qo'shish (keyingi qatorlarda dublikat bo'lmasligi uchun)
                if (created.sku) existingSkuMap.set(created.sku, created.id);
                results.created++;
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Noma\'lum xato';
                results.errors.push({ row: i + 1, error: msg });
            }
        }

        return NextResponse.json({
            success: true,
            created: results.created,
            updated: results.updated,
            errors: results.errors,
            total: products.length,
        });
    } catch (error) {
        console.error('[API/products/bulk-import]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/products/bulk-import — Namunaviy CSV template yuklash ──────────
export async function GET() {
    const csv = [
        'name,sku,price,originalPrice,categorySlug,description,image,status',
        'Polietilen paket 30x40,PKT-001,1500,5000,polietilen-paketlar,30x40 sm polietilen paket,,active',
        'Kraft paket 20x30,KFT-002,2500,10000,kraft-paketlar,Kraft qogoz paket,,active',
    ].join('\n');

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="products-template.csv"',
        },
    });
}
